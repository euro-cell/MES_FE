import { useEffect, useRef, useState } from 'react';
import { uploadIQCProtoXlsx } from '../../../api/quality/IQCProtoService';
import { getErrorMessage } from '../../../api/errorHandler';
import '@univerjs/preset-sheets-core/lib/index.css';
import '@univerjs/preset-sheets-drawing/lib/index.css';

interface UIToggles {
  header: boolean;
  toolbar: boolean;
  footer: boolean;
  formulaBar: boolean;
  contextMenu: boolean;
}

const DEFAULT_TOGGLES: UIToggles = {
  header: true,
  toolbar: true,
  footer: true,
  formulaBar: true,
  contextMenu: true,
};

const TOGGLE_LABELS: Record<keyof UIToggles, string> = {
  header: '헤더',
  toolbar: '리본 툴바',
  footer: '시트탭/푸터',
  formulaBar: '수식 입력줄',
  contextMenu: '우클릭 메뉴',
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

  useEffect(() => {
    return () => {
      univerRef.current?.univer?.dispose?.();
    };
  }, []);

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
    univerAPI.createWorkbook(workbookData);
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
    if (workbookDataRef.current) {
      await renderWorkbook(workbookDataRef.current, next);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>IQC 프로토타입 (Univer, 검증용)</h2>
      <p style={{ color: '#666', fontSize: 13 }}>
        실제 서비스 메뉴가 아닙니다. xlsx 업로드 시 백엔드가 Univer CLI로 변환한 워크북 데이터를 받아 렌더링합니다. 셀
        값/서식/PNG·JPEG 이미지는 재현되지만 EMF 이미지와 PDF 첨부(OLE 임베디드 객체)는 재현되지 않습니다.
      </p>

      <input type='file' accept='.xlsx' onChange={handleFileChange} disabled={status === 'loading'} />

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

      {status === 'loading' && <p>업로드 및 변환 중... (파일 크기에 따라 다소 걸릴 수 있습니다)</p>}
      {status === 'error' && <p style={{ color: 'crimson' }}>오류: {errorMsg}</p>}

      <div ref={containerRef} style={{ width: '100%', height: '80vh', marginTop: 16, border: '1px solid #ddd' }} />
    </div>
  );
}
