import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { IQCItem, IQCResult, IQCCoaRef } from '../IQCTypes';
import { getMaterialsByCategory, getMaterialLots } from '../../../../api/material';

interface ElectrolyteTableProps {
  data?: IQCItem;
  projectId: number;
  onSave?: (data: Partial<IQCItem>) => Promise<void>;
}

const getDefaultResults = (): IQCResult[] => [
  { category: '수분', unit: 'ppm', spec: '≤20.0', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', isPassed: null, note: '' },
];

const getDefaultCoaRefs = (): IQCCoaRef[] => [
  { attrName: 'PC(Wt%)', attrValue: '' },
  { attrName: 'EP(Wt%)', attrValue: '' },
  { attrName: 'PP(Wt%)', attrValue: '' },
  { attrName: 'LiPF6(%)', attrValue: '' },
  { attrName: 'TMSB(%)', attrValue: '' },
  { attrName: 'HF(ppm)', attrValue: '' },
  { attrName: 'Color(APHA)', attrValue: '' },
  { attrName: 'Density(g/cc)', attrValue: '' },
];

const defaultItem = (): IQCItem => ({
  id: 0,
  category: '전해액',
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

const ElectrolyteTable: React.FC<ElectrolyteTableProps> = ({ data, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<IQCItem>(defaultItem());

  const [materials, setMaterials] = useState<{ id: number; type: string; name: string; company: string }[]>([]);
  const [lots, setLots] = useState<{ id: number; lot: string; name: string; receivedDate: string; remainingQty: number }[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLots, setSelectedLots] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setEditData({
        ...data,
        results: data.results && data.results.length > 0 ? data.results : getDefaultResults(),
        coaRefs: data.coaRefs && data.coaRefs.length > 0 ? data.coaRefs : getDefaultCoaRefs(),
        images: data.images ?? [],
      });
    } else {
      setEditData(defaultItem());
    }
  }, [data]);

  useEffect(() => {
    if (isEditing) getMaterialsByCategory('전해액').then(setMaterials);
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
        getMaterialLots({ category: '전해액', type }).then((res) => {
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
      getMaterialLots({ category: '전해액', type: selectedType }).then((res) => {
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
    getMaterialLots({ category: '전해액', type: selectedType }).then((res) => {
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

  const handleSave = async () => {
    if (onSave) { await onSave(editData); resetSelections(); setIsEditing(false); }
  };

  const handleCancel = () => {
    resetSelections();
    setEditData(data
      ? { ...data, results: data.results && data.results.length > 0 ? data.results : getDefaultResults(), coaRefs: data.coaRefs && data.coaRefs.length > 0 ? data.coaRefs : getDefaultCoaRefs(), images: data.images ?? [] }
      : defaultItem());
    setIsEditing(false);
  };

  const results = editData.results ?? [];
  const coaRefs = editData.coaRefs ?? [];

  const updateResult = (index: number, field: keyof IQCResult, value: string | boolean | null) => {
    const updated = [...results];
    (updated[index] as any)[field] = value;
    if (field === 'sample1' || field === 'sample2' || field === 'sample3') {
      const s1 = parseFloat(String(field === 'sample1' ? value : (updated[index].sample1 ?? '')));
      const s2 = parseFloat(String(field === 'sample2' ? value : (updated[index].sample2 ?? '')));
      const s3 = parseFloat(String(field === 'sample3' ? value : (updated[index].sample3 ?? '')));
      const valid = [s1, s2, s3].filter((v) => !isNaN(v));
      updated[index].average = valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : '';
    }
    setEditData({ ...editData, results: updated });
  };

  const getPassDisplay = (pass: boolean | null | undefined) => {
    if (pass === null || pass === undefined) return { text: '미판정', color: '#94a3b8' };
    return pass ? { text: '합', color: '#16a34a' } : { text: '불', color: '#dc2626' };
  };

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
                    getMaterialLots({ category: '전해액', type: data.type }).then((res) => {
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
          <col style={{ width: '10%' }} /><col style={{ width: '7%' }} />
          <col style={{ width: '10%' }} /><col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} /><col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} /><col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} /><col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>검사 항목</th><th rowSpan={2}>단위</th><th rowSpan={2}>규격</th>
            <th colSpan={2}>Reference</th><th colSpan={4}>검사 결과</th>
            <th rowSpan={2}>합불판정</th><th rowSpan={2}>비고</th>
          </tr>
          <tr><th>CoA</th><th>Last data</th><th>샘플1</th><th>샘플2</th><th>샘플3</th><th>평균</th></tr>
        </thead>
        <tbody>
          {results.map((result, i) => {
            const passDisplay = getPassDisplay(result.isPassed);
            return (
              <tr key={i}>
                <td className={styles.itemCell}>
                  {isEditing ? <input type="text" value={result.category} onChange={(e) => updateResult(i, 'category', e.target.value)} className={styles.tableInput} /> : result.category}
                </td>
                <td>{isEditing ? <input type="text" value={result.unit ?? ''} onChange={(e) => updateResult(i, 'unit', e.target.value)} className={styles.tableInput} /> : result.unit}</td>
                <td>{isEditing ? <input type="text" value={result.spec ?? ''} onChange={(e) => updateResult(i, 'spec', e.target.value)} className={styles.tableInput} /> : result.spec}</td>
                <td>{isEditing ? <input type="text" value={result.refCoa ?? ''} onChange={(e) => updateResult(i, 'refCoa', e.target.value)} className={styles.tableInput} /> : result.refCoa}</td>
                <td>{isEditing ? <input type="text" value={String(result.refLastData ?? '')} onChange={(e) => updateResult(i, 'refLastData', e.target.value)} className={styles.tableInput} /> : result.refLastData}</td>
                <td>{isEditing ? <input type="text" value={String(result.sample1 ?? '')} onChange={(e) => updateResult(i, 'sample1', e.target.value)} className={styles.tableInput} /> : result.sample1}</td>
                <td>{isEditing ? <input type="text" value={String(result.sample2 ?? '')} onChange={(e) => updateResult(i, 'sample2', e.target.value)} className={styles.tableInput} /> : result.sample2}</td>
                <td>{isEditing ? <input type="text" value={String(result.sample3 ?? '')} onChange={(e) => updateResult(i, 'sample3', e.target.value)} className={styles.tableInput} /> : result.sample3}</td>
                <td>{result.average != null && result.average !== '' ? parseFloat(String(result.average)).toFixed(2) : ''}</td>
                <td className={styles.passCell} style={{ color: passDisplay.color, fontWeight: 600 }}>
                  {isEditing ? (
                    <select value={result.isPassed === null || result.isPassed === undefined ? 'null' : result.isPassed ? 'true' : 'false'} onChange={(e) => { const v = e.target.value; updateResult(i, 'isPassed', v === 'null' ? null : v === 'true'); }} className={styles.tableSelect}>
                      <option value="null">미판정</option>
                      <option value="true">합</option>
                      <option value="false">불</option>
                    </select>
                  ) : passDisplay.text}
                </td>
                <td>{isEditing ? <input type="text" value={result.note ?? ''} onChange={(e) => updateResult(i, 'note', e.target.value)} className={styles.tableInput} /> : result.note}</td>
              </tr>
            );
          })}
        </tbody>
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
    </div>
  );
};

export default ElectrolyteTable;
