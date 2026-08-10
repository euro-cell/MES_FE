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
import fileButtonStyles from '../../../styles/stock/material/electrode.module.css';
import '@univerjs/preset-sheets-core/lib/index.css';
import '@univerjs/preset-sheets-drawing/lib/index.css';

interface SheetTabInfo {
  sheetId: string;
  name: string;
}

/**
 * 프로젝트에 등록된 IQC 검사 엑셀을 그대로 열람하는 화면 (읽기 전용 뷰어).
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
  const [isExporting, setIsExporting] = useState(false);
  const [sheetTabs, setSheetTabs] = useState<SheetTabInfo[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<{ fileName: string; uploadedAt: string } | null>(null);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
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
          await renderWorkbook(workbookData);
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

  const renderWorkbook = async (workbookData: Record<string, unknown>) => {
    if (!containerRef.current) return;

    univerRef.current?.univer?.dispose?.();
    containerRef.current.innerHTML = '';

    const { createUniver, LocaleType, mergeLocales } = await import('@univerjs/presets');
    const { UniverSheetsCorePreset } = await import('@univerjs/preset-sheets-core');
    const sheetsCoreKoKR = (await import('@univerjs/preset-sheets-core/locales/ko-KR')).default;
    const { UniverSheetsDrawingPreset } = await import('@univerjs/preset-sheets-drawing');
    const sheetsDrawingKoKR = (await import('@univerjs/preset-sheets-drawing/locales/ko-KR')).default;

    // 읽기 전용 모드 경고 문구를 뷰어 화면에 맞게 오버라이드
    const VIEWER_ONLY_MESSAGE = '이 화면은 열람용입니다.';
    const permissionDialogOverride = {
      dialog: {
        alertContent: VIEWER_ONLY_MESSAGE,
        commonErr: VIEWER_ONLY_MESSAGE,
        editErr: VIEWER_ONLY_MESSAGE,
        formulaErr: VIEWER_ONLY_MESSAGE,
        pasteErr: VIEWER_ONLY_MESSAGE,
        setStyleErr: VIEWER_ONLY_MESSAGE,
        copyErr: VIEWER_ONLY_MESSAGE,
        workbookCopyErr: VIEWER_ONLY_MESSAGE,
        setRowColStyleErr: VIEWER_ONLY_MESSAGE,
        moveRowColErr: VIEWER_ONLY_MESSAGE,
        moveRangeErr: VIEWER_ONLY_MESSAGE,
        insertRowColErr: VIEWER_ONLY_MESSAGE,
        removeRowColErr: VIEWER_ONLY_MESSAGE,
        autoFillErr: VIEWER_ONLY_MESSAGE,
        filterErr: VIEWER_ONLY_MESSAGE,
        operatorSheetErr: VIEWER_ONLY_MESSAGE,
        printErr: VIEWER_ONLY_MESSAGE,
        hyperLinkErr: VIEWER_ONLY_MESSAGE,
        commentErr: VIEWER_ONLY_MESSAGE,
      },
    };
    const viewerLocaleOverride = {
      sheets: { permission: permissionDialogOverride },
      'sheets-ui': { permission: permissionDialogOverride },
    };

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.KO_KR,
      locales: { [LocaleType.KO_KR]: mergeLocales(sheetsCoreKoKR, sheetsDrawingKoKR, viewerLocaleOverride) },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
          header: false,
          toolbar: false,
          footer: false,
          formulaBar: false,
          contextMenu: false,
        }),
        UniverSheetsDrawingPreset(),
      ],
    });

    univerRef.current = { univer, univerAPI };
    const fWorkbook = univerAPI.createWorkbook(workbookData);

    // 뷰어 전용: 셀 내용을 고칠 수 없도록 읽기 전용 모드로 고정
    await fWorkbook.getWorkbookPermission().setReadOnly();

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
      await renderWorkbook(workbookData);
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

  const handleSheetTabClick = (sheetId: string) => {
    const fWorkbook = univerRef.current?.univerAPI?.getActiveWorkbook?.();
    if (!fWorkbook) return;
    const sheet = fWorkbook.getSheetBySheetId(sheetId);
    if (!sheet) return;
    fWorkbook.setActiveSheet(sheet);
    syncSheetTabs();
  };

  const handleDownload = async () => {
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
      console.error('IQC Proto2 xlsx 다운로드 실패:', err);
      setErrorMsg(getErrorMessage(err, 'xlsx 다운로드에 실패했습니다.'));
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
          {sheetTabs.length > 0 && (
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
                <label className={fileButtonStyles.uploadButton} style={{ cursor: 'pointer' }}>
                  📤 엑셀 재업로드
                  <input type='file' accept='.xlsx' onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
                <button
                  type='button'
                  className={fileButtonStyles.downloadButton}
                  onClick={handleDownload}
                  disabled={isExporting}
                >
                  📥 {isExporting ? '다운로드 중...' : '엑셀 다운로드'}
                </button>
              </div>
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
