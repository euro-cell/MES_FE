import { useEffect, useRef, useState } from 'react';
import { uploadIQCProto3Xlsx } from '../../../api/quality/IQCProto3Service';
import { getErrorMessage } from '../../../api/errorHandler';

/**
 * Univer Office SDK Developer Preview(2026-08-27 공개, @univerjs/preset-sheets-advanced
 * 1.0.0-beta.2) 실험 화면. daemon(Proto2)과 달리 Collaboration 서버나 백엔드 프록시
 * 릴레이 없이, 브라우저 안에서 SheetsAdvancedPreset + 라이선스만으로 워터마크 없이
 * 차트까지 렌더링되는지 검증한다.
 *
 * 백엔드: POST /quality/iqc-proto3/upload (multipart, xlsx) -> { workbookData, fileName, license }
 * 라이선스는 daemon(Proto2)용으로 이미 발급받은 값을 그대로 재사용하며, 프론트 번들에
 * 굳히지 않기 위해 업로드 응답으로 서버가 내려준다.
 */
export default function IQCProto3Index() {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<{ univer: any } | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    return () => {
      univerRef.current?.univer?.dispose?.();
      univerRef.current = null;
    };
  }, []);

  const renderWorkbook = async (workbookData: Record<string, unknown>, license: string) => {
    if (!containerRef.current) return;

    univerRef.current?.univer?.dispose?.();
    containerRef.current.innerHTML = '';

    const { createUniver, LocaleType, LogLevel, mergeLocales } = await import('@univerjs/presets');
    const { UniverInstanceType } = await import('@univerjs/core');
    const { UniverSheetsCorePreset } = await import('@univerjs/preset-sheets-core');
    await import('@univerjs/preset-sheets-core/lib/index.css');
    const sheetsCoreEnUS = (await import('@univerjs/preset-sheets-core/locales/en-US')).default;
    const { UniverSheetsDrawingPreset } = await import('@univerjs/preset-sheets-drawing');
    await import('@univerjs/preset-sheets-drawing/lib/index.css');
    const sheetsDrawingEnUS = (await import('@univerjs/preset-sheets-drawing/locales/en-US')).default;
    const { UniverSheetsAdvancedPreset } = await import('@univerjs/preset-sheets-advanced');
    await import('@univerjs/preset-sheets-advanced/lib/index.css');
    const sheetsAdvancedEnUS = (await import('@univerjs/preset-sheets-advanced/locales/en-US')).default;

    const { univer } = createUniver({
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS, sheetsDrawingEnUS, sheetsAdvancedEnUS) },
      logLevel: LogLevel.WARN,
      presets: [
        UniverSheetsCorePreset({ container: containerRef.current }),
        UniverSheetsDrawingPreset(),
        UniverSheetsAdvancedPreset({ license }),
      ],
    });

    univerRef.current = { univer };
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const result = await uploadIQCProto3Xlsx(file);
      await renderWorkbook(result.workbookData, result.license);
      setFileName(result.fileName);
      setStatus('ready');
    } catch (err) {
      console.error('IQC Proto3 xlsx 업로드/렌더링 실패:', err);
      setErrorMsg(getErrorMessage(err, 'xlsx 변환에 실패했습니다.'));
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>IQC 프로토타입3 (Univer Office SDK Developer Preview 실험)</h2>
      <p style={{ color: '#666', fontSize: 13 }}>
        실제 서비스 메뉴가 아닙니다. Collaboration 서버나 daemon 없이, 브라우저 단독으로 신버전 SDK
        (preset-sheets-advanced)를 붙여 워터마크 없이 차트까지 렌더링되는지 검증합니다. xlsx 업로드 시 백엔드가
        CLI로 워크북 JSON만 변환해 반환하고, 실제 렌더링은 이 화면(브라우저)에서 이루어집니다.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input type='file' accept='.xlsx' onChange={handleFileChange} disabled={status === 'loading'} />
        {fileName && status === 'ready' && (
          <span style={{ color: '#888', fontSize: 12 }}>현재 표시 중: {fileName}</span>
        )}
      </div>

      {status === 'loading' && <p>업로드 및 변환 중... (파일 크기에 따라 다소 걸릴 수 있습니다)</p>}
      {status === 'error' && <p style={{ color: 'crimson' }}>오류: {errorMsg}</p>}

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '80vh',
          border: '1px solid #ddd',
          display: status === 'ready' ? 'block' : 'none',
        }}
      />
      {status !== 'ready' && (
        <div
          style={{
            width: '100%',
            height: '80vh',
            border: '1px dashed #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          xlsx 파일을 업로드하세요
        </div>
      )}
    </div>
  );
}
