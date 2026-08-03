import { useEffect, useRef, useState } from 'react';
import {
  uploadIQCProtoXlsx,
  exportIQCProtoXlsx,
  getLatestIQCProtoWorkbook,
} from '../../../api/quality/IQCProtoService';
import { getErrorMessage } from '../../../api/errorHandler';
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

const TOGGLES_STORAGE_KEY = 'xlsxUiToggles';

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
 * 프로토타입 전용 화면. xlsx 업로드 → 백엔드가 Univer CLI로 변환해 워크북 JSON을 반환
 * → Univer 오픈소스 SDK(createUniver)로 렌더링. UI 요소(헤더/툴바/시트탭/수식바/우클릭메뉴)는
 * 버튼으로 켜고 끌 수 있음.
 * 실제 서비스 메뉴가 아니며 검증이 끝나면 폴더째로 삭제 가능.
 * 백엔드: POST /quality/iqc-proto/upload (multipart, xlsx) -> { workbookData }
 */
export default function IQCProtoIndex() {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<{ univer: any; univerAPI: any } | null>(null);
  const workbookDataRef = useRef<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [toggles, setToggles] = useState<UIToggles>(loadStoredToggles);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetTabs, setSheetTabs] = useState<SheetTabInfo[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<{ fileName: string; uploadedAt: string } | null>(null);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus('loading');
      try {
        const latest = await getLatestIQCProtoWorkbook();
        if (cancelled) return;

        if (latest.workbookData) {
          workbookDataRef.current = latest.workbookData;
          await renderWorkbook(latest.workbookData, toggles);
          if (latest.fileName && latest.uploadedAt) {
            setSavedInfo({ fileName: latest.fileName, uploadedAt: latest.uploadedAt });
          }
          setStatus('ready');
        } else {
          setStatus('idle');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('IQC Proto 저장된 워크북 조회 실패:', err);
        setErrorMsg(getErrorMessage(err, '저장된 워크북을 불러오지 못했습니다.'));
        setStatus('error');
      } finally {
        if (!cancelled) setIsFetchingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
      univerRef.current?.univer?.dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !containerRef.current) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const workbookData = await uploadIQCProtoXlsx(file);
      workbookDataRef.current = workbookData;
      await renderWorkbook(workbookData, toggles);
      setSavedInfo({ fileName: file.name, uploadedAt: new Date().toISOString() });
      setStatus('ready');
    } catch (err) {
      console.error('IQC Proto xlsx 업로드/렌더링 실패:', err);
      setErrorMsg(getErrorMessage(err, 'xlsx 변환에 실패했습니다.'));
      setStatus('error');
    }
  };

  const handleToggle = async (key: keyof UIToggles) => {
    const value = !toggles[key];
    const next = { ...toggles, [key]: value };

    // header는 toolbar/formulaBar의 상위 컨테이너. header를 끄면 하위 항목도 화면에서
    // 사라지므로 상태도 함께 꺼서 버튼 표시와 실제 렌더링을 일치시킴.
    if (key === 'header' && !value) {
      next.toolbar = false;
      next.formulaBar = false;
    }

    setToggles(next);
    localStorage.setItem(TOGGLES_STORAGE_KEY, JSON.stringify(next));

    // customSheetTabs는 Univer 프리셋 옵션이 아니라 화면에 커스텀 메뉴를 그릴지 여부일 뿐이라
    // 워크북 재생성 없이 즉시 반영됨
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
    if (!univerAPI) return;

    setIsExporting(true);
    setErrorMsg('');

    try {
      const workbookData = univerAPI.getActiveWorkbook().save();
      const { blob, filename } = await exportIQCProtoXlsx(workbookData);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('IQC Proto xlsx 내보내기 실패:', err);
      setErrorMsg(getErrorMessage(err, 'xlsx 내보내기에 실패했습니다.'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>IQC 프로토타입 (Univer, 검증용)</h2>
      <p style={{ color: '#666', fontSize: 13 }}>
        실제 서비스 메뉴가 아닙니다. xlsx 업로드 시 백엔드가 Univer CLI로 변환한 워크북 데이터를 받아 렌더링합니다. 셀
        값/서식/PNG·JPEG 이미지는 재현되지만 EMF 이미지와 PDF 첨부(OLE 임베디드 객체)는 재현되지 않습니다.
      </p>

      {savedInfo && (
        <p style={{ color: '#888', fontSize: 12, marginTop: -8 }}>
          현재 표시 중: {savedInfo.fileName} (업로드: {new Date(savedInfo.uploadedAt).toLocaleString()})
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type='file' accept='.xlsx' onChange={handleFileChange} disabled={status === 'loading'} />
        <button
          type='button'
          onClick={handleExport}
          disabled={status !== 'ready' || isExporting}
          title={status !== 'ready' ? '파일을 먼저 업로드해주세요' : undefined}
          style={{
            padding: '6px 14px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #16a34a',
            background: status !== 'ready' || isExporting ? '#f3f4f6' : '#f0fdf4',
            color: status !== 'ready' || isExporting ? '#9ca3af' : '#16a34a',
            cursor: status !== 'ready' || isExporting ? 'not-allowed' : 'pointer',
          }}
        >
          {isExporting ? '내보내는 중...' : '엑셀로 내보내기'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {(Object.keys(TOGGLE_LABELS) as (keyof UIToggles)[]).map(key => {
          const isOn = toggles[key];
          const isDependentOnHeader = (key === 'toolbar' || key === 'formulaBar') && !toggles.header;
          const isDisabled = status !== 'ready' || isDependentOnHeader;
          return (
            <button
              key={key}
              type='button'
              onClick={() => {
                if (isDisabled) return;
                handleToggle(key);
              }}
              aria-disabled={isDisabled}
              title={
                isDependentOnHeader
                  ? '헤더를 먼저 켜야 사용할 수 있습니다'
                  : status !== 'ready'
                    ? '파일을 먼저 업로드해주세요'
                    : undefined
              }
              style={{
                padding: '6px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid ' + (isOn ? '#2563eb' : '#d1d5db'),
                background: isOn ? '#eff6ff' : '#f9fafb',
                color: isOn ? '#2563eb' : '#6b7280',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDependentOnHeader ? 0.5 : 1,
              }}
            >
              {TOGGLE_LABELS[key]} {isOn ? 'ON' : 'OFF'}
            </button>
          );
        })}
      </div>

      {status === 'loading' && (
        <p>
          {isFetchingInitial
            ? '서버에 저장된 워크북을 불러오는 중...'
            : '업로드 및 변환 중... (파일 크기에 따라 다소 걸릴 수 있습니다)'}
        </p>
      )}
      {status === 'error' && <p style={{ color: 'crimson' }}>오류: {errorMsg}</p>}

      {toggles.customSheetTabs && sheetTabs.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginTop: 16,
            padding: '8px 8px 0',
            flexWrap: 'wrap',
            borderBottom: '1px solid #ddd',
          }}
        >
          {sheetTabs.map(tab => {
            const isActive = tab.sheetId === activeSheetId;
            return (
              <button
                key={tab.sheetId}
                type='button'
                onClick={() => handleSheetTabClick(tab.sheetId)}
                style={{
                  padding: '6px 14px',
                  fontSize: 13,
                  borderRadius: '6px 6px 0 0',
                  border: '1px solid ' + (isActive ? '#2563eb' : '#d1d5db'),
                  borderBottom: isActive ? '1px solid #fff' : '1px solid #d1d5db',
                  marginBottom: -1,
                  background: isActive ? '#fff' : '#f9fafb',
                  color: isActive ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '80vh',
          marginTop: toggles.customSheetTabs && sheetTabs.length > 0 ? 0 : 16,
          border: '1px solid #ddd',
        }}
      />
    </div>
  );
}
