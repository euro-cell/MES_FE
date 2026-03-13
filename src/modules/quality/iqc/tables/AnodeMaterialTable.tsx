import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { IQCItem, IQCResult, IQCCoaRef, IQCPsdData } from '../IQCTypes';
import { getMaterialsByCategory, getMaterialLots } from '../../../../api/material';
import { uploadIQCImages, deleteIQCImage, updateIQCImageLabel, uploadIQCFile, deleteIQCFile } from '../../../../api/quality/IQCService';

/** 붙여넣기 텍스트 → IQCPsdData[] 파싱 */
function parsePsdText(text: string): IQCPsdData[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const result: IQCPsdData[] = [];
  let sizes: number[] = [];
  let volumes: number[] = [];
  let mode: 'size' | 'volume' | null = null;

  for (const line of lines) {
    if (line === 'Size (μm)' || line === 'Size (µm)') {
      if (sizes.length > 0 && volumes.length > 0) {
        const len = Math.min(sizes.length, volumes.length);
        for (let i = 0; i < len; i++) result.push({ size: sizes[i], volumeIn: volumes[i] });
      }
      sizes = []; volumes = []; mode = 'size';
    } else if (line === '% Volume In') {
      mode = 'volume';
    } else if (line === 'Result') {
      mode = null;
    } else {
      const num = parseFloat(line);
      if (!isNaN(num)) {
        if (mode === 'size') sizes.push(num);
        else if (mode === 'volume') volumes.push(num);
      }
    }
  }
  // 마지막 세트
  if (sizes.length > 0 && volumes.length > 0) {
    const len = Math.min(sizes.length, volumes.length);
    for (let i = 0; i < len; i++) result.push({ size: sizes[i], volumeIn: volumes[i] });
  }
  return result;
}

interface AnodeMaterialTableProps {
  data?: IQCItem;
  productionId: number;
  onSave?: (data: Partial<IQCItem>) => Promise<void>;
}

const IMAGE_TYPES = ['PSD', 'Half cell', 'FE-SEM(배율: x1,000)'];



const getDefaultResults = (): IQCResult[] => [
  { category: '입도', item: 'D10', unit: '㎛',    spec: '3.0±1.5',  refCoa: '',    refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: '입도', item: 'D50', unit: '㎛',    spec: '8.5±2.5',  refCoa: '',    refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: '입도', item: 'D90', unit: '㎛',    spec: '≤30.0',    refCoa: '',    refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: '수분',              unit: 'ppm',   spec: '≤1000',    refCoa: '',    refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: '탭밀도',            unit: 'g/cc',  spec: '≥1.00',    refCoa: '',    refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: 'pH',                unit: '',      spec: 'N/A',       refCoa: '',    refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: 'Half cell', item: '0.1C',     unit: 'mAh/g', spec: '≥165.0',  refCoa: 'N/A', refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '2.5-1.0V' },
  { category: 'Half cell', item: '1st 효율', unit: '%',     spec: '≥95.0',   refCoa: '',    refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: 'Half cell', item: '0.5C',     unit: 'mAh/g', spec: 'TBD',     refCoa: 'N/A', refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
  { category: 'Half cell', item: '1.0C',     unit: 'mAh/g', spec: '≥160',    refCoa: 'N/A', refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
];

const getDefaultCoaRefs = (): IQCCoaRef[] => [
  { attrName: 'BET(㎡/g)', attrValue: '' },
];

const defaultItem = (): IQCItem => ({
  id: 0,
  category: '음극재',
  type: '',
  name: '',
  manufacturer: '',
  lotNo: '',
  usage: '',
  receiptDate: '',
  inspectionDate: '',
  inspector: '',
  remark: '',
  results: getDefaultResults(),
  coaRefs: getDefaultCoaRefs(),
  images: [],
});

const AnodeMaterialTable: React.FC<AnodeMaterialTableProps> = ({ data, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<IQCItem>(defaultItem());

  const [materials, setMaterials] = useState<{ id: number; type: string; name: string; company: string }[]>([]);
  const [lots, setLots] = useState<{ id: number; lot: string; name: string; receivedDate: string; remainingQty: number }[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [psdText, setPsdText] = useState('');
  const [psdData, setPsdData] = useState<IQCPsdData[]>([]);
  const [psdRefLabels, setPsdRefLabels] = useState<string[]>(['', '']);
  const [semRefLabels, setSemRefLabels] = useState<string[]>(['', '', '']);
  const [psdFiles, setPsdFiles] = useState<{ id?: number; fileName: string; filePath?: string }[]>([]);
  const [uploadingPsdFile, setUploadingPsdFile] = useState(false);

  useEffect(() => {
    if (data) {
      setEditData({
        ...data,
        results: data.results && data.results.length > 0 ? data.results : getDefaultResults(),
        coaRefs: data.coaRefs && data.coaRefs.length > 0 ? data.coaRefs : getDefaultCoaRefs(),
        images: data.images ?? [],
      });
      setPsdData(data.psdData ?? []);
      // PSD/SEM 참조 이미지 레이블 복원
      const imgs = data.images ?? [];
      // PSD 참조 슬롯 수: 저장된 이미지 기반으로 복원, 최소 2개
      const psdIdxs = imgs.filter((im) => im.imageType?.startsWith('PSD_REF_')).map((im) => parseInt(im.imageType!.replace('PSD_REF_', ''), 10)).filter((n) => !isNaN(n));
      const psdCount = Math.max(2, psdIdxs.length > 0 ? Math.max(...psdIdxs) + 1 : 2);
      setPsdRefLabels(
        Array.from({ length: psdCount }, (_, i) =>
          imgs.find((im) => im.imageType === `PSD_REF_${i}`)?.imageLabel ?? ''
        )
      );
      // SEM 참조 슬롯 수: 저장된 이미지 기반으로 복원, 최소 3개
      const semIdxs = imgs.filter((im) => im.imageType?.startsWith('SEM_REF_')).map((im) => parseInt(im.imageType!.replace('SEM_REF_', ''), 10)).filter((n) => !isNaN(n));
      const semCount = Math.max(3, semIdxs.length > 0 ? Math.max(...semIdxs) + 1 : 3);
      setSemRefLabels(
        Array.from({ length: semCount }, (_, i) =>
          imgs.find((im) => im.imageType === `SEM_REF_${i}`)?.imageLabel ?? ''
        )
      );
      setPsdFiles((data.files ?? []).filter((f) => f.fileType === 'PSD_DOC'));
    } else {
      setEditData(defaultItem());
      setPsdData([]);
      setPsdRefLabels(['', '']);
      setSemRefLabels(['', '', '']);
      setPsdFiles([]);
    }
  }, [data]);

  useEffect(() => {
    if (isEditing) getMaterialsByCategory('음극재').then(setMaterials);
  }, [isEditing]);

  const resetSelections = () => {
    setSelectedType(''); setSelectedName(''); setSelectedCompany('');
    setSelectedLots([]); setLots([]);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type); setSelectedLots([]); setLots([]);
    if (!type) {
      setSelectedName(''); setSelectedCompany('');
      setEditData((prev) => ({ ...prev, type: '', name: '', manufacturer: '', lotNo: '' }));
      return;
    }
    const filtered = materials.filter((m) => m.type === type);
    const autoName = [...new Set(filtered.map((m) => m.name))].length === 1 ? filtered[0].name : '';
    setSelectedName(autoName); setSelectedCompany('');
    setEditData((prev) => ({ ...prev, type, name: autoName, manufacturer: '', lotNo: '' }));
    if (autoName) {
      const companies = [...new Set(filtered.filter((m) => m.name === autoName).map((m) => m.company))];
      const autoCompany = companies.length === 1 ? companies[0] : '';
      setSelectedCompany(autoCompany);
      setEditData((prev) => ({ ...prev, type, name: autoName, manufacturer: autoCompany, lotNo: '' }));
      if (autoCompany) {
        getMaterialLots({ category: '음극재', type }).then((res) => {
          const lf = res.filter((l) => l.name === autoName);
          setLots(lf);
          const autoLots = lf.length === 1 ? [lf[0].lot] : [];
          setSelectedLots(autoLots);
          setEditData((prev) => ({ ...prev, type, name: autoName, manufacturer: autoCompany, lotNo: autoLots.join(', '), receiptDate: autoLots.length > 0 ? (lf[0].receivedDate || prev.receiptDate) : prev.receiptDate }));
        });
      }
    }
  };

  const handleNameChange = (name: string) => {
    setSelectedName(name); setSelectedLots([]); setLots([]);
    if (!name) {
      setSelectedCompany('');
      setEditData((prev) => ({ ...prev, name: '', manufacturer: '', lotNo: '' }));
      return;
    }
    const filtered = materials.filter((m) => m.type === selectedType && m.name === name);
    const autoCompany = [...new Set(filtered.map((m) => m.company))].length === 1 ? filtered[0].company : '';
    setSelectedCompany(autoCompany);
    setEditData((prev) => ({ ...prev, name, manufacturer: autoCompany, lotNo: '' }));
    if (autoCompany) {
      getMaterialLots({ category: '음극재', type: selectedType }).then((res) => {
        const lf = res.filter((l) => l.name === name);
        setLots(lf);
        const autoLots = lf.length === 1 ? [lf[0].lot] : [];
        setSelectedLots(autoLots);
        setEditData((prev) => ({ ...prev, name, manufacturer: autoCompany, lotNo: autoLots.join(', '), receiptDate: autoLots.length > 0 ? (lf[0].receivedDate || prev.receiptDate) : prev.receiptDate }));
      });
    }
  };

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company); setSelectedLots([]); setLots([]);
    setEditData((prev) => ({ ...prev, manufacturer: company, lotNo: '' }));
    if (!company) return;
    getMaterialLots({ category: '음극재', type: selectedType }).then((res) => {
      const lf = res.filter((l) => l.name === selectedName);
      setLots(lf);
      const autoLots = lf.length === 1 ? [lf[0].lot] : [];
      setSelectedLots(autoLots);
      setEditData((prev) => ({ ...prev, manufacturer: company, lotNo: autoLots.join(', '), receiptDate: autoLots.length > 0 ? (lf[0].receivedDate || prev.receiptDate) : prev.receiptDate }));
    });
  };

  const handleLotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedLots(selected);
    setEditData((prev) => ({ ...prev, lotNo: selected.join(', ') }));
  };

  const handlePsdTextChange = (text: string) => {
    setPsdText(text);
    const parsed = parsePsdText(text);
    setPsdData(parsed);
    setEditData((prev) => ({ ...prev, psdData: parsed }));
  };

  const handleSave = async () => {
    if (onSave) { await onSave({ ...editData, psdData }); resetSelections(); setIsEditing(false); }
  };

  const handleCancel = () => {
    resetSelections();
    setPsdText('');
    const restored = data
      ? { ...data, results: data.results && data.results.length > 0 ? data.results : getDefaultResults(), coaRefs: data.coaRefs && data.coaRefs.length > 0 ? data.coaRefs : getDefaultCoaRefs(), images: data.images ?? [] }
      : defaultItem();
    setEditData(restored);
    setPsdData(data?.psdData ?? []);
    const imgs = data?.images ?? [];
    const cancelPsdIdxs = imgs.filter((im) => im.imageType?.startsWith('PSD_REF_')).map((im) => parseInt(im.imageType!.replace('PSD_REF_', ''), 10)).filter((n) => !isNaN(n));
    const cancelPsdCount = Math.max(2, cancelPsdIdxs.length > 0 ? Math.max(...cancelPsdIdxs) + 1 : 2);
    setPsdRefLabels(Array.from({ length: cancelPsdCount }, (_, i) => imgs.find((im) => im.imageType === `PSD_REF_${i}`)?.imageLabel ?? ''));
    const cancelSemIdxs = imgs.filter((im) => im.imageType?.startsWith('SEM_REF_')).map((im) => parseInt(im.imageType!.replace('SEM_REF_', ''), 10)).filter((n) => !isNaN(n));
    const cancelSemCount = Math.max(3, cancelSemIdxs.length > 0 ? Math.max(...cancelSemIdxs) + 1 : 3);
    setSemRefLabels(Array.from({ length: cancelSemCount }, (_, i) => imgs.find((im) => im.imageType === `SEM_REF_${i}`)?.imageLabel ?? ''));
    setPsdFiles((data?.files ?? []).filter((f) => f.fileType === 'PSD_DOC'));
    setIsEditing(false);
  };

  const handleImageUpload = async (imageType: string, files: FileList | null, imageLabel?: string) => {
    if (!files || files.length === 0) return;
    if (!data?.id) { alert('먼저 저장 후 이미지를 업로드해주세요.'); return; }
    setUploadingType(imageType);
    try {
      const uploaded = await uploadIQCImages(data.id, imageType, Array.from(files), imageLabel);
      setEditData((prev) => ({ ...prev, images: [...(prev.images ?? []).filter((im) => im.imageType !== imageType), ...uploaded] }));
    } catch { alert('이미지 업로드에 실패했습니다.'); }
    finally { setUploadingType(null); }
  };

  const handleRefLabelChange = async (imageType: string, label: string, setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    setter((prev) => { const next = [...prev]; next[idx] = label; return next; });
    // 해당 슬롯에 이미 업로드된 이미지가 있으면 백엔드 레이블도 업데이트
    const imgs = (editData.images ?? []).filter((im) => im.imageType === imageType);
    for (const img of imgs) {
      if (img.id) {
        try { await updateIQCImageLabel(img.id, label); } catch { /* 무시 */ }
      }
    }
    // editData 내 imageLabel도 동기화
    setEditData((prev) => ({
      ...prev,
      images: (prev.images ?? []).map((im) =>
        im.imageType === imageType ? { ...im, imageLabel: label } : im
      ),
    }));
  };

  const handleImageDelete = async (imageId: number) => {
    if (!confirm('이미지를 삭제하시겠습니까?')) return;
    try {
      await deleteIQCImage(imageId);
      setEditData((prev) => ({ ...prev, images: (prev.images ?? []).filter((im) => im.id !== imageId) }));
    } catch { alert('이미지 삭제에 실패했습니다.'); }
  };

  const handlePsdFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!data?.id) { alert('먼저 저장 후 파일을 업로드해주세요.'); return; }
    setUploadingPsdFile(true);
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadIQCFile(data.id, 'PSD_DOC', file);
        setPsdFiles((prev) => [...prev, uploaded]);
      }
    } catch { alert('파일 업로드에 실패했습니다.'); }
    finally { setUploadingPsdFile(false); }
  };

  const handlePsdFileDelete = async (fileId: number) => {
    if (!confirm('파일을 삭제하시겠습니까?')) return;
    try {
      await deleteIQCFile(fileId);
      setPsdFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch { alert('파일 삭제에 실패했습니다.'); }
  };

  const handleAddRefSlot = (type: 'PSD' | 'SEM') => {
    if (type === 'PSD') setPsdRefLabels((prev) => [...prev, '']);
    else setSemRefLabels((prev) => [...prev, '']);
  };

  const handleRemoveRefSlot = async (type: 'PSD' | 'SEM', idx: number) => {
    const imageType = `${type}_REF_${idx}`;
    const imgs = (editData.images ?? []).filter((im) => im.imageType === imageType);
    if (imgs.length > 0) {
      if (!confirm('해당 슬롯의 이미지를 삭제하고 슬롯을 제거하시겠습니까?')) return;
      for (const img of imgs) {
        if (img.id) {
          try { await deleteIQCImage(img.id); } catch { /* 무시 */ }
        }
      }
    }
    // 삭제된 슬롯 이후의 imageType 인덱스를 한 칸씩 앞으로 당김
    setEditData((prev) => ({
      ...prev,
      images: (prev.images ?? [])
        .filter((im) => im.imageType !== imageType)
        .map((im) => {
          const prefix = `${type}_REF_`;
          if (!im.imageType?.startsWith(prefix)) return im;
          const n = parseInt(im.imageType.replace(prefix, ''), 10);
          if (isNaN(n) || n <= idx) return im;
          return { ...im, imageType: `${prefix}${n - 1}` };
        }),
    }));
    if (type === 'PSD') setPsdRefLabels((prev) => prev.filter((_, i) => i !== idx));
    else setSemRefLabels((prev) => prev.filter((_, i) => i !== idx));
  };

  const results = editData.results ?? [];
  const coaRefs = editData.coaRefs ?? [];

  const updateResult = (index: number, field: keyof IQCResult, value: string | boolean | null) => {
    const updated = [...results];
    (updated[index] as any)[field] = value;
    setEditData({ ...editData, results: updated });
  };

  const getPassDisplay = (pass: boolean | null | undefined) => {
    if (pass === null || pass === undefined) return { text: '미판정', color: '#94a3b8' };
    return pass ? { text: '합', color: '#16a34a' } : { text: '불', color: '#dc2626' };
  };

  const renderInspectionRows = () => {
    const rows: React.JSX.Element[] = [];
    let i = 0;
    while (i < results.length) {
      const current = results[i];
      const subItems = [current];
      let j = i + 1;
      while (j < results.length && results[j].category === current.category && results[j].item) {
        subItems.push(results[j]); j++;
      }
      if (subItems.length > 1 || current.item) {
        subItems.forEach((result, subIndex) => {
          const actualIndex = i + subIndex;
          rows.push(
            <tr key={actualIndex}>
              {subIndex === 0 && (
                <td rowSpan={subItems.length} className={styles.itemCell}>
                  {isEditing ? (
                    <input type="text" value={result.category} onChange={(e) => { const updated = [...results]; for (let k = 0; k < subItems.length; k++) updated[i + k].category = e.target.value; setEditData({ ...editData, results: updated }); }} className={styles.tableInput} />
                  ) : result.category}
                </td>
              )}
              <td className={styles.subItemCell}>
                {isEditing ? <input type="text" value={result.item || ''} onChange={(e) => updateResult(actualIndex, 'item', e.target.value)} className={styles.tableInput} /> : result.item || ''}
              </td>
              {renderResultCells(result, actualIndex)}
            </tr>
          );
        });
        i = j;
      } else {
        rows.push(
          <tr key={i}>
            <td colSpan={2} className={styles.itemCell}>
              {isEditing ? <input type="text" value={current.category} onChange={(e) => updateResult(i, 'category', e.target.value)} className={styles.tableInput} /> : current.category}
            </td>
            {renderResultCells(current, i)}
          </tr>
        );
        i++;
      }
    }
    return rows;
  };

  const renderResultCells = (result: IQCResult, index: number) => {
    const passDisplay = getPassDisplay(result.isPassed);
    return (
      <>
        <td>{isEditing ? <input type="text" value={result.unit ?? ''} onChange={(e) => updateResult(index, 'unit', e.target.value)} className={styles.tableInput} /> : result.unit}</td>
        <td>{isEditing ? <input type="text" value={result.spec ?? ''} onChange={(e) => updateResult(index, 'spec', e.target.value)} className={styles.tableInput} /> : result.spec}</td>
        <td>{isEditing ? <input type="text" value={result.refCoa ?? ''} onChange={(e) => updateResult(index, 'refCoa', e.target.value)} className={styles.tableInput} /> : result.refCoa}</td>
        <td>{isEditing ? <input type="text" value={String(result.refLastData ?? '')} onChange={(e) => updateResult(index, 'refLastData', e.target.value)} className={styles.tableInput} /> : result.refLastData}</td>
        <td>{isEditing ? <input type="text" value={String(result.sample1 ?? '')} onChange={(e) => updateResult(index, 'sample1', e.target.value)} className={styles.tableInput} /> : result.sample1}</td>
        <td>{isEditing ? <input type="text" value={String(result.sample2 ?? '')} onChange={(e) => updateResult(index, 'sample2', e.target.value)} className={styles.tableInput} /> : result.sample2}</td>
        <td>{isEditing ? <input type="text" value={String(result.sample3 ?? '')} onChange={(e) => updateResult(index, 'sample3', e.target.value)} className={styles.tableInput} /> : result.sample3}</td>
        <td>{result.average ?? ''}</td>
        <td className={styles.passCell} style={{ color: passDisplay.color, fontWeight: 600 }}>
          {isEditing ? (
            <select value={result.isPassed === null || result.isPassed === undefined ? 'null' : result.isPassed ? 'true' : 'false'} onChange={(e) => { const v = e.target.value; updateResult(index, 'isPassed', v === 'null' ? null : v === 'true'); }} className={styles.tableSelect}>
              <option value="null">미판정</option>
              <option value="true">합</option>
              <option value="false">불</option>
            </select>
          ) : passDisplay.text}
        </td>
        <td>{isEditing ? <input type="text" value={result.note ?? ''} onChange={(e) => updateResult(index, 'note', e.target.value)} className={styles.tableInput} /> : result.note}</td>
      </>
    );
  };

  const renderImageSection = (imageTypes: string[]) => (
    <div className={styles.imageGrid}>
      {imageTypes.map((label) => {
        const imgs = (editData.images ?? []).filter((im) => im.imageType === label);
        const isUploading = uploadingType === label;
        return (
          <div key={label} className={styles.imageBox}>
            <div className={styles.imageLabel}>{label}</div>
            <div className={styles.imageContent}>
              {imgs.length > 0 ? (
                <div className={styles.imageList}>
                  {imgs.map((img) => (
                    <div key={img.id} className={styles.imageItem}>
                      <img src={img.filePath?.replace('data/uploads', '/uploads')} alt={label} className={styles.resultImage} />
                      {isEditing && img.id && <button className={styles.imageDeleteBtn} onClick={() => handleImageDelete(img.id!)}>✕</button>}
                    </div>
                  ))}
                </div>
              ) : isEditing ? (
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: isUploading ? 'not-allowed' : 'pointer', color: '#94a3b8', fontSize: '13px', flexDirection: 'column', gap: '4px' }}>
                  {isUploading ? '업로드 중...' : <>
                    <span style={{ fontSize: '24px' }}>+</span>
                    <span>이미지 업로드</span>
                  </>}
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleImageUpload(label, e.target.files)} />
                </label>
              ) : <span className={styles.noImage}>이미지 없음</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.tableContainer}>
      {/* 타이틀 및 버튼 */}
      <div className={styles.tableTitleRow}>
        <h3 className={styles.tableTitle}>■ 수입검사 결과</h3>
        <div>
          {!isEditing ? (
            <button className={styles.specButton} onClick={() => {
                if (data) {
                  setSelectedType(data.type ?? '');
                  setSelectedName(data.name ?? '');
                  setSelectedCompany(data.manufacturer ?? '');
                  setSelectedLots(data.lotNo ? data.lotNo.split(', ') : []);
                  if (data.type && data.name) {
                    getMaterialLots({ category: '음극재', type: data.type }).then((res) => {
                      setLots(res.filter((l) => l.name === data.name));
                    });
                  }
                }
                setIsEditing(true);
              }}>{data ? '수정' : '등록'}</button>
          ) : (
            <>
              <button className={styles.saveButton} onClick={handleSave} style={{ marginRight: '8px' }}>저장</button>
              <button className={styles.cancelButton} onClick={handleCancel}>취소</button>
            </>
          )}
        </div>
      </div>

      {/* 기본 정보 테이블 */}
      <table className={styles.iqcTable}>
        <colgroup>
          <col style={{ width: '12%' }} /><col style={{ width: '16%' }} /><col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} /><col style={{ width: '12%' }} /><col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} /><col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr><th>품목</th><th>품명</th><th>제조원</th><th>Lot no.</th><th>사용처</th><th>입고일</th><th>검사일</th><th>검사자</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>{isEditing ? (<select value={selectedType} onChange={(e) => handleTypeChange(e.target.value)} className={styles.tableSelect}><option value="">선택</option>{[...new Set(materials.map((m) => m.type))].map((t) => <option key={t} value={t}>{t}</option>)}</select>) : editData.type}</td>
            <td>{isEditing ? (<select value={selectedName} onChange={(e) => handleNameChange(e.target.value)} disabled={!selectedType} className={styles.tableSelect}><option value="">선택</option>{[...new Set(materials.filter((m) => m.type === selectedType).map((m) => m.name))].map((n) => <option key={n} value={n}>{n}</option>)}</select>) : editData.name}</td>
            <td>{isEditing ? (<select value={selectedCompany} onChange={(e) => handleCompanyChange(e.target.value)} disabled={!selectedName} className={styles.tableSelect}><option value="">선택</option>{[...new Set(materials.filter((m) => m.type === selectedType && m.name === selectedName).map((m) => m.company))].map((c) => <option key={c} value={c}>{c}</option>)}</select>) : editData.manufacturer}</td>
            <td>{isEditing ? (<select multiple value={selectedLots} onChange={handleLotChange} disabled={!selectedCompany} className={styles.tableSelect} style={{ height: '80px' }}>{lots.map((l) => <option key={l.lot} value={l.lot}>{l.lot}</option>)}</select>) : editData.lotNo}</td>
            <td>{isEditing ? <input type="text" value={editData.usage ?? ''} onChange={(e) => setEditData({ ...editData, usage: e.target.value })} className={styles.tableInput} /> : editData.usage}</td>
            <td>{isEditing ? <input type="date" value={editData.receiptDate ?? ''} onChange={(e) => setEditData({ ...editData, receiptDate: e.target.value })} className={styles.tableInput} /> : editData.receiptDate}</td>
            <td>{isEditing ? <input type="date" value={editData.inspectionDate ?? ''} onChange={(e) => setEditData({ ...editData, inspectionDate: e.target.value })} className={styles.tableInput} /> : editData.inspectionDate}</td>
            <td>{isEditing ? <input type="text" value={editData.inspector ?? ''} onChange={(e) => setEditData({ ...editData, inspector: e.target.value })} className={styles.tableInput} /> : editData.inspector}</td>
          </tr>
        </tbody>
      </table>

      {/* 검사 결과 테이블 */}
      <table className={styles.iqcTable} style={{ marginTop: '-1px' }}>
        <colgroup>
          <col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '6%' }} />
          <col style={{ width: '9%' }} /><col style={{ width: '7%' }} /><col style={{ width: '7%' }} />
          <col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} />
          <col style={{ width: '7%' }} /><col style={{ width: '7%' }} /><col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr>
            <th colSpan={2} rowSpan={2}>검사 항목</th><th rowSpan={2}>단위</th><th rowSpan={2}>규격</th>
            <th colSpan={2}>Reference</th><th colSpan={4}>검사 결과</th>
            <th rowSpan={2}>합불판정</th><th rowSpan={2}>비고</th>
          </tr>
          <tr><th>CoA</th><th>Last data</th><th>샘플1</th><th>샘플2</th><th>샘플3</th><th>평균</th></tr>
        </thead>
        <tbody>{renderInspectionRows()}</tbody>
      </table>

      {/* 기타 CoA 참조 결과 */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ 기타 CoA 참조 결과</h3>
      </div>
      <table className={styles.iqcTable}>
        <colgroup>{coaRefs.map((_, i) => <col key={i} style={{ width: `${100 / coaRefs.length}%` }} />)}</colgroup>
        <thead><tr>{coaRefs.map((ref, i) => <th key={i}>{ref.attrName}</th>)}</tr></thead>
        <tbody>
          <tr>
            {coaRefs.map((ref, i) => (
              <td key={i}>
                {isEditing ? (
                  <input type="text" value={ref.attrValue ?? ''} onChange={(e) => { const updated = [...coaRefs]; updated[i] = { ...updated[i], attrValue: e.target.value }; setEditData({ ...editData, coaRefs: updated }); }} className={styles.tableInput} />
                ) : ref.attrValue}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* 수입검사 결과 이미지 */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ 수입검사 결과 이미지</h3>
      </div>
      {renderImageSection(IMAGE_TYPES)}

      {/* Remark */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ Remark</h3>
      </div>
      <div className={styles.remarkBox}>
        {isEditing ? (
          <textarea className={styles.remarkTextarea} value={editData.remark ?? ''} onChange={(e) => setEditData({ ...editData, remark: e.target.value })} placeholder="비고를 입력하세요..." />
        ) : (
          <pre className={styles.remarkContent}>{editData.remark || '비고 없음'}</pre>
        )}
      </div>

      {/* PSD 자료 */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ PSD 자료</h3>
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
        {psdFiles.length === 0 && !isEditing ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>첨부 파일 없음</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {psdFiles.map((f, i) => (
              <li key={f.id ?? f.fileName} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: i < psdFiles.length - 1 ? '1px solid #f1f5f9' : undefined, background: '#fff' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>📄</span>
                <span style={{ flex: 1, fontSize: '13px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</span>
                <a
                  href={f.filePath?.replace('data/uploads', '/uploads')}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flexShrink: 0, fontSize: '12px', color: '#2563eb', border: '1px solid #93c5fd', borderRadius: '4px', padding: '3px 10px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  열기
                </a>
                {isEditing && f.id && (
                  <button
                    onClick={() => handlePsdFileDelete(f.id!)}
                    style={{ flexShrink: 0, background: 'none', border: '1px solid #fca5a5', borderRadius: '4px', color: '#dc2626', cursor: 'pointer', fontSize: '12px', padding: '3px 8px' }}
                  >
                    삭제
                  </button>
                )}
              </li>
            ))}
            {isEditing && (
              <li style={{ padding: '10px 14px', background: '#f8fafc', borderTop: psdFiles.length > 0 ? '1px solid #e2e8f0' : undefined }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: uploadingPsdFile ? 'not-allowed' : 'pointer', fontSize: '13px', color: uploadingPsdFile ? '#94a3b8' : '#2563eb', fontWeight: 600 }}>
                  {uploadingPsdFile ? (
                    <>
                      <span style={{ fontSize: '16px' }}>⏳</span> 업로드 중...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '16px' }}>+</span> PDF 파일 추가
                    </>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    style={{ display: 'none' }}
                    disabled={uploadingPsdFile}
                    onChange={(e) => handlePsdFileUpload(e.target.files)}
                  />
                </label>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* PSD raw data */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ PSD raw data</h3>
      </div>
      {isEditing && (
        <div style={{ marginBottom: '8px' }}>
          <textarea
            style={{ width: '100%', height: '160px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
            placeholder={'여기에 PSD raw data를 붙여넣으세요.\n예)\nSize (μm)\n0.0100\n0.0114\n% Volume In\n0.12\n0.23\n...'}
            value={psdText}
            onChange={(e) => handlePsdTextChange(e.target.value)}
          />
          {psdData.length > 0 && (
            <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
              ✓ {psdData.length}개 데이터 파싱 완료
            </div>
          )}
        </div>
      )}
      {psdData.length > 0 ? (() => {
        const COLS = 5;
        const colSize = Math.ceil(psdData.length / COLS);
        const columns: { size: number; volumeIn: number }[][] = Array.from({ length: COLS }, (_, i) =>
          psdData.slice(i * colSize, (i + 1) * colSize)
        );
        const rowCount = colSize;
        return (
          <table className={styles.iqcTable}>
            <thead>
              <tr>
                {columns.map((_, i) => (
                  <React.Fragment key={i}>
                    <th style={{ background: '#FFFF00', color: '#000', borderLeft: i > 0 ? '2px solid #888' : undefined }}>Size(㎛)</th>
                    <th style={{ background: '#FFFF00', color: '#000' }}>Volume In %</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <React.Fragment key={colIdx}>
                      <td style={{ textAlign: 'right', borderLeft: colIdx > 0 ? '2px solid #888' : undefined }}>{col[rowIdx]?.size ?? ''}</td>
                      <td style={{ textAlign: 'right' }}>{col[rowIdx]?.volumeIn ?? ''}</td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })() : (
        <div style={{ padding: '16px', color: '#94a3b8', textAlign: 'center' }}>
          {isEditing ? '위 텍스트 박스에 PSD raw data를 붙여넣으면 표로 변환됩니다.' : 'PSD raw data 없음'}
        </div>
      )}

      {/* PSD 참조 결과 & SEM Image 참조 결과 (좌/우 나란히) */}
      <div style={{ display: 'flex', gap: '0', marginTop: '16px', borderTop: '2px solid #888' }}>

        {/* 좌: PSD 참조 결과 */}
        <div style={{ flex: '0 0 50%', borderRight: '1px solid #ccc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 4px 8px 4px' }}>
            <h3 className={styles.tableTitle} style={{ margin: 0 }}>■ PSD 참조 결과</h3>
            {isEditing && (
              <button onClick={() => handleAddRefSlot('PSD')} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: '1px solid #2563eb', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>+ 슬롯 추가</button>
            )}
          </div>
          {psdRefLabels.map((label, idx) => {
            const imageType = `PSD_REF_${idx}`;
            const imgs = (editData.images ?? []).filter((im) => im.imageType === imageType);
            const isUploading = uploadingType === imageType;
            return (
              <div key={idx} className={styles.imageBox} style={{ marginBottom: '4px' }}>
                <div className={styles.imageLabel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', background: '#fff' }}>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={label}
                        placeholder="레이블 입력"
                        onChange={(e) => handleRefLabelChange(imageType, e.target.value, setPsdRefLabels, idx)}
                        className={styles.tableInput}
                        style={{ width: '160px' }}
                      />
                      <button onClick={() => handleRemoveRefSlot('PSD', idx)} style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: '1px solid #dc2626', borderRadius: '4px', padding: '1px 6px', cursor: 'pointer' }}>슬롯 삭제</button>
                    </>
                  ) : label}
                </div>
                <div className={styles.imageContent}>
                  {imgs.length > 0 ? (
                    <div className={styles.imageList}>
                      {imgs.map((img) => (
                        <div key={img.id} className={styles.imageItem}>
                          <img src={img.filePath?.replace('data/uploads', '/uploads')} alt={label} className={styles.resultImage} />
                          {isEditing && img.id && <button className={styles.imageDeleteBtn} onClick={() => handleImageDelete(img.id!)}>✕</button>}
                        </div>
                      ))}
                    </div>
                  ) : isEditing ? (
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: isUploading ? 'not-allowed' : 'pointer', color: '#94a3b8', fontSize: '13px', flexDirection: 'column', gap: '4px' }}>
                      {isUploading ? '업로드 중...' : <><span style={{ fontSize: '24px' }}>+</span><span>이미지 업로드</span></>}
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleImageUpload(imageType, e.target.files, label)} />
                    </label>
                  ) : <span className={styles.noImage}>이미지 없음</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* 우: SEM Image 참조 결과 */}
        <div style={{ flex: '0 0 50%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 4px 8px 4px' }}>
            <h3 className={styles.tableTitle} style={{ margin: 0 }}>■ SEM Image 참조 결과</h3>
            {isEditing && (
              <button onClick={() => handleAddRefSlot('SEM')} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: '1px solid #2563eb', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>+ 슬롯 추가</button>
            )}
          </div>
          {semRefLabels.map((label, idx) => {
            const imageType = `SEM_REF_${idx}`;
            const imgs = (editData.images ?? []).filter((im) => im.imageType === imageType);
            const isUploading = uploadingType === imageType;
            return (
              <div key={idx} className={styles.imageBox} style={{ marginBottom: '4px' }}>
                <div className={styles.imageLabel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', background: '#fff' }}>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={label}
                        placeholder="레이블 입력"
                        onChange={(e) => handleRefLabelChange(imageType, e.target.value, setSemRefLabels, idx)}
                        className={styles.tableInput}
                        style={{ width: '160px' }}
                      />
                      <button onClick={() => handleRemoveRefSlot('SEM', idx)} style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: '1px solid #dc2626', borderRadius: '4px', padding: '1px 6px', cursor: 'pointer' }}>슬롯 삭제</button>
                    </>
                  ) : label}
                </div>
                <div className={styles.imageContent}>
                  {imgs.length > 0 ? (
                    <div className={styles.imageList}>
                      {imgs.map((img) => (
                        <div key={img.id} className={styles.imageItem}>
                          <img src={img.filePath?.replace('data/uploads', '/uploads')} alt={label} className={styles.resultImage} />
                          {isEditing && img.id && <button className={styles.imageDeleteBtn} onClick={() => handleImageDelete(img.id!)}>✕</button>}
                        </div>
                      ))}
                    </div>
                  ) : isEditing ? (
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: isUploading ? 'not-allowed' : 'pointer', color: '#94a3b8', fontSize: '13px', flexDirection: 'column', gap: '4px' }}>
                      {isUploading ? '업로드 중...' : <><span style={{ fontSize: '24px' }}>+</span><span>이미지 업로드</span></>}
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleImageUpload(imageType, e.target.files, label)} />
                    </label>
                  ) : <span className={styles.noImage}>이미지 없음</span>}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AnodeMaterialTable;
