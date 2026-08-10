import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  uploadIQCProto2Workbook,
  exportIQCProto2Xlsx,
  getIQCProto2Workbook,
  fetchWorkbookDataFromUrl,
} from '../../../api/quality/IQCProto2Service';
import { getIQCProject } from '../../../api/quality/IQCService';
import { getErrorMessage } from '../../../api/errorHandler';
import type { IQCProject } from '../iqc/IQCTypes';
import submenuStyles from '../../../styles/components/moduleIndex.module.css';
import pageStyles from '../../../styles/quality/iqc/IQCPage.module.css';
import '@univerjs/preset-sheets-core/lib/index.css';
import '@univerjs/preset-sheets-drawing/lib/index.css';

interface UIToggles {
  header: boolean;
  toolbar: boolean;
  footer: boolean;
  formulaBar: boolean;
  contextMenu: boolean;
  customSheetTabs: boolean;
}

interface SheetTabInfo {
  sheetId: string;
  name: string;
}

const DEFAULT_TOGGLES: UIToggles = {
  header: true,
  toolbar: true,
  footer: true,
  formulaBar: true,
  contextMenu: true,
  customSheetTabs: true,
};

const TOGGLE_LABELS: Record<keyof UIToggles, string> = {
  header: '헤더',
  toolbar: '리본 툴바',
  footer: '시트탭/푸터',
  formulaBar: '수식 입력줄',
  contextMenu: '우클릭 메뉴',
  customSheetTabs: '커스텀 시트 메뉴',
};

const TOGGLES_STORAGE_KEY = 'xlsx_ui_toggles';

function loadStoredToggles(): UIToggles {
  try {
    const raw = localStorage.getItem(TOGGLES_STORAGE_KEY);
    if (!raw) return DEFAULT_TOGGLES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TOGGLES, ...parsed };
  } catch {
    return DEFAULT_TOGGLES;
  }
}

/**
 * 프로젝트에 등록된 IQC 검사 엑셀을 그대로 열람하는 화면.
 * 워크북이 등록되어 있으면 시트탭이 정식 메뉴처럼(submenuBar 스타일) 상단에 노출되고,
 * 클릭 시 페이지 이동 없이 해당 시트로 전환된다. 미등록 프로젝트는 업로드 화면만 표시.
 * 백엔드: POST /quality/iqc-proto2/detail/:projectId/workbook/upload
 * GET /quality/iqc-proto2/detail/:projectId/workbook
 */
export default function IQCProto2Page() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<{ univer: any; univerAPI: any } | null>(null);
  const workbookDataRef = useRef<Record<string, unknown> | null>(null);
  const [project, setProject] = useState<IQCProject | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [toggles, setToggles] = useState<UIToggles>(loadStoredToggles);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetTabs, setSheetTabs] = useState<SheetTabInfo[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<{ fileName: string; uploadedAt: string } | null>(null);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const id = Number(projectId);
    if (!id) return;
    getIQCProject(id)
      .then(setProject)
      .catch(err => console.error('IQC Proto2 프로젝트 정보 조회 실패:', err));
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    const id = Number(projectId);
    if (!id) return;

    (async () => {
      setStatus('loading');
      setIsFetchingInitial(true);
      try {
        const latest = await getIQCProto2Workbook(id);
        if (cancelled) return;

        if (latest.workbookDataUrl) {
          const workbookData = await fetchWorkbookDataFromUrl(latest.workbookDataUrl);
          if (cancelled) return;

          workbookDataRef.current = workbookData;
          await renderWorkbook(workbookData, toggles);
          if (latest.fileName && latest.uploadedAt) {
            setSavedInfo({ fileName: latest.fileName, uploadedAt: latest.uploadedAt });
          }
          setStatus('ready');
        } else {
          setStatus('idle');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('IQC Proto2 등록된 워크북 조회 실패:', err);
        setErrorMsg(getErrorMessage(err, '등록된 워크북을 불러오지 못했습니다.'));
        setStatus('error');
      } finally {
        if (!cancelled) setIsFetchingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
      univerRef.current?.univer?.dispose?.();
      univerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const syncSheetTabs = () => {
    const fWorkbook = univerRef.current?.univerAPI?.getActiveWorkbook?.();
    if (!fWorkbook) return;
    const sheets = fWorkbook
      .getSheets()
      .filter((sheet: any) => !sheet.isSheetHidden())
      .map((sheet: any) => ({
        sheetId: sheet.getSheetId(),
        name: sheet.getSheetName(),
      }));
    setSheetTabs(sheets);
    setActiveSheetId(fWorkbook.getActiveSheet()?.getSheetId() ?? null);
  };

  const renderWorkbook = async (workbookData: Record<string, unknown>, uiToggles: UIToggles) => {
    if (!containerRef.current) return;

    univerRef.current?.univer?.dispose?.();
    containerRef.current.innerHTML = '';

    const { createUniver, LocaleType, mergeLocales } = await import('@univerjs/presets');
    const { UniverSheetsCorePreset } = await import('@univerjs/preset-sheets-core');
    const sheetsCoreKoKR = (await import('@univerjs/preset-sheets-core/locales/ko-KR')).default;
    const { UniverSheetsDrawingPreset } = await import('@univerjs/preset-sheets-drawing');
    const sheetsDrawingKoKR = (await import('@univerjs/preset-sheets-drawing/locales/ko-KR')).default;

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.KO_KR,
      locales: { [LocaleType.KO_KR]: mergeLocales(sheetsCoreKoKR, sheetsDrawingKoKR) },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
          header: uiToggles.header,
          toolbar: uiToggles.toolbar,
          footer: uiToggles.footer ? undefined : false,
          formulaBar: uiToggles.formulaBar,
          contextMenu: uiToggles.contextMenu,
        }),
        UniverSheetsDrawingPreset(),
      ],
    });

    univerRef.current = { univer, univerAPI };
    const fWorkbook = univerAPI.createWorkbook(workbookData);

    fWorkbook.onCommandExecuted((command: { id: string }) => {
      if (command.id === 'sheet.operation.set-worksheet-active') {
        syncSheetTabs();
      }
    });
    syncSheetTabs();
  };

  const uploadFile = async (file: File) => {
    const id = Number(projectId);
    if (!file || !id) return;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setErrorMsg('xlsx 파일만 업로드할 수 있습니다.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const workbookData = await uploadIQCProto2Workbook(id, file);
      workbookDataRef.current = workbookData;
      await renderWorkbook(workbookData, toggles);
      setSavedInfo({ fileName: file.name, uploadedAt: new Date().toISOString() });
      setStatus('ready');
    } catch (err) {
      console.error('IQC Proto2 xlsx 업로드/렌더링 실패:', err);
      setErrorMsg(getErrorMessage(err, 'xlsx 변환에 실패했습니다.'));
      setStatus('error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleToggle = async (key: keyof UIToggles) => {
    const value = !toggles[key];
    const next = { ...toggles, [key]: value };

    if (key === 'header' && !value) {
      next.toolbar = false;
      next.formulaBar = false;
    }

    setToggles(next);
    localStorage.setItem(TOGGLES_STORAGE_KEY, JSON.stringify(next));

    if (key === 'customSheetTabs') return;

    if (workbookDataRef.current) {
      await renderWorkbook(workbookDataRef.current, next);
    }
  };

  const handleSheetTabClick = (sheetId: string) => {
    const fWorkbook = univerRef.current?.univerAPI?.getActiveWorkbook?.();
    if (!fWorkbook) return;
    const sheet = fWorkbook.getSheetBySheetId(sheetId);
    if (!sheet) return;
    fWorkbook.setActiveSheet(sheet);
    syncSheetTabs();
  };

  const handleExport = async () => {
    const univerAPI = univerRef.current?.univerAPI;
    const id = Number(projectId);
    if (!univerAPI || !id) return;

    setIsExporting(true);
    setErrorMsg('');

    try {
      const workbookData = univerAPI.getActiveWorkbook().save();
      const { blob, filename } = await exportIQCProto2Xlsx(id, workbookData);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('IQC Proto2 xlsx 내보내기 실패:', err);
      setErrorMsg(getErrorMessage(err, 'xlsx 내보내기에 실패했습니다.'));
    } finally {
      setIsExporting(false);
    }
  };

  const hasWorkbook: boolean = status === 'ready' || (status === 'loading' && !isFetchingInitial);

  return (
    <div style={{ padding: 16 }}>
      <div className={pageStyles.projectHeader}>
        <h2>프로젝트: {project?.name ?? ''}</h2>
        <button className={pageStyles.backButton} onClick={() => navigate('/quality/iqc-proto2')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      {/* 워크북 등록 전: 업로드 화면만 단독 표시 */}
      {!hasWorkbook && status !== 'loading' && (
        <div style={{ maxWidth: 560, margin: '24px auto', textAlign: 'center' }}>
          <h3 style={{ marginBottom: 20, color: '#1e293b' }}>등록된 IQC 검사 엑셀이 없습니다</h3>
          <label
            htmlFor='iqc-proto2-upload'
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '80px 20px',
              border: `2px dashed ${isDragging ? '#2563eb' : '#93c5fd'}`,
              borderRadius: 12,
              background: isDragging ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 40 }}>📄</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#2563eb' }}>
              {isDragging ? '여기에 놓아 업로드' : 'xlsx 파일 선택'}
            </span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>클릭하거나 파일을 끌어다 놓으세요</span>
            <input
              id='iqc-proto2-upload'
              type='file'
              accept='.xlsx'
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {status === 'error' && <p style={{ color: 'crimson', marginTop: 12 }}>오류: {errorMsg}</p>}
        </div>
      )}

      {status === 'loading' && isFetchingInitial && <p>등록된 워크북을 불러오는 중...</p>}

      <div style={{ display: hasWorkbook ? 'block' : 'none' }}>
        <>
          {/* 시트탭을 정식 메뉴(submenuBar)와 동일한 스타일로 렌더링. 페이지 이동 없이 로컬 상태로 시트 전환 */}
          {toggles.customSheetTabs && sheetTabs.length > 0 && (
            <div className={submenuStyles.submenuWrapper}>
              <div className={submenuStyles.submenuBar}>
                {sheetTabs.map(tab => (
                  <button
                    key={tab.sheetId}
                    type='button'
                    onClick={() => handleSheetTabClick(tab.sheetId)}
                    className={`${submenuStyles.submenuButton} ${tab.sheetId === activeSheetId ? submenuStyles.active : ''}`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label className={submenuStyles.downloadBtn} style={{ cursor: 'pointer' }}>
                  엑셀 재업로드
                  <input type='file' accept='.xlsx' onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
                <button
                  type='button'
                  className={submenuStyles.downloadBtn}
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? '내보내는 중...' : '엑셀로 내보내기'}
                </button>
                <button
                  type='button'
                  className={submenuStyles.downloadBtn}
                  onClick={() => setShowOptions(prev => !prev)}
                >
                  {showOptions ? '옵션 숨기기' : '옵션'}
                </button>
              </div>
            </div>
          )}

          {showOptions && (
            <div style={{ display: 'flex', gap: 8, margin: '0 0 12px 15px', flexWrap: 'wrap' }}>
              {(Object.keys(TOGGLE_LABELS) as (keyof UIToggles)[]).map(key => {
                const isOn = toggles[key];
                const isDependentOnHeader = (key === 'toolbar' || key === 'formulaBar') && !toggles.header;
                return (
                  <button
                    key={key}
                    type='button'
                    onClick={() => {
                      if (isDependentOnHeader) return;
                      handleToggle(key);
                    }}
                    title={isDependentOnHeader ? '헤더를 먼저 켜야 사용할 수 있습니다' : undefined}
                    style={{
                      padding: '6px 12px',
                      fontSize: 13,
                      borderRadius: 6,
                      border: '1px solid ' + (isOn ? '#2563eb' : '#d1d5db'),
                      background: isOn ? '#eff6ff' : '#f9fafb',
                      color: isOn ? '#2563eb' : '#6b7280',
                      cursor: isDependentOnHeader ? 'not-allowed' : 'pointer',
                      opacity: isDependentOnHeader ? 0.5 : 1,
                    }}
                  >
                    {TOGGLE_LABELS[key]} {isOn ? 'ON' : 'OFF'}
                  </button>
                );
              })}
            </div>
          )}

          {savedInfo && (
            <p style={{ color: '#888', fontSize: 12, margin: '0 0 8px 15px' }}>
              현재 표시 중: {savedInfo.fileName} (업로드: {new Date(savedInfo.uploadedAt).toLocaleString()})
            </p>
          )}

          {status === 'error' && <p style={{ color: 'crimson', marginLeft: 15 }}>오류: {errorMsg}</p>}

          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '80vh',
              border: '1px solid #ddd',
            }}
          />
        </>
      </div>
    </div>
  );
}
