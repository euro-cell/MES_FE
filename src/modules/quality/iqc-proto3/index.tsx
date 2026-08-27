import { useEffect, useState } from 'react';
import { uploadIQCProto3Xlsx } from '../../../api/quality/IQCProto3Service';
import { getErrorMessage } from '../../../api/errorHandler';

/**
 * daemon 뷰어는 localStorage 키 `univer-collab-client-sidebar-collapsed`가 'true'면
 * 좌측 사이드바를 접힌 상태로 렌더링한다 (뷰어 앱이 부팅 시 이 값을 읽기만 하고, 값이
 * 없으면 기본값=펼침으로 뜬다). 뷰어를 iframe에 붙이기 전에 미리 심어둔다.
 * 뷰어 URL이 이 페이지와 same-origin일 때(배포: nginx가 /univer-viewer/로 프록시, 로컬
 * dev: vite가 /univer-viewer 프록시) 부모 window.localStorage에 쓰면 iframe이 그대로
 * 읽는다. 뷰어가 다른 origin(예: 127.0.0.1:9123 직접 접속)이면 적용되지 않는다.
 */
const SIDEBAR_COLLAPSED_KEY = 'univer-collab-client-sidebar-collapsed';

/**
 * Univer CLI daemon 웹뷰어를 iframe으로 임베드하는 실험 화면.
 * 브라우저 SDK(preset-sheets-advanced) 경로는 Pro 라이선스 워터마크가 뜨지만,
 * daemon이 서빙하는 뷰어(univer open으로 얻는 URL)는 워터마크 없이 차트/이미지까지
 * 렌더링됨을 앞선 검증으로 확인했다. 이 화면은 xlsx를 업로드하면 백엔드가 daemon에
 * import하고 뷰어 URL을 반환해, 그 URL을 자동으로 iframe에 붙이는 흐름을 확인한다.
 *
 * daemon은 백엔드 서버 프로세스 안에서 로컬(127.0.0.1)로 구동되며, 뷰어 URL도 백엔드
 * 기준 로컬 주소이므로 지금은 백엔드와 프론트가 같은 머신에서 개발 서버로 동작할 때만
 * 정상적으로 열린다. 실제 배포 환경에서 daemon을 상시 구동하고 nginx로 프록시하는 것은
 * 별도 검증이 필요하다. 편집은 daemon 뷰어가 기본적으로 읽기 전용이라 지원되지 않으며,
 * IQC 열람 용도로는 문제없다.
 * 백엔드: POST /quality/iqc-proto3/upload (multipart, xlsx) -> { viewerUrl, fileName }
 */
export default function IQCProto3Index() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [viewerUrl, setViewerUrl] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'true');
    } catch {
      // localStorage 접근 불가 환경은 무시
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const result = await uploadIQCProto3Xlsx(file);
      setViewerUrl(result.viewerUrl);
      setFileName(result.fileName);
      setStatus('ready');
    } catch (err) {
      console.error('IQC Proto3 xlsx 업로드/뷰어 조회 실패:', err);
      setErrorMsg(getErrorMessage(err, 'xlsx 변환에 실패했습니다.'));
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>IQC 프로토타입3 (Univer CLI daemon 뷰어 iframe 실험)</h2>
      <p style={{ color: '#666', fontSize: 13 }}>
        실제 서비스 메뉴가 아닙니다. xlsx 업로드 시 백엔드가 Univer CLI daemon에 import하고 뷰어 URL을 반환하며, 그
        URL을 아래 iframe에 자동으로 표시합니다. 이 뷰어는 읽기 전용이며 워터마크 없이 차트까지 렌더링됩니다. 백엔드
        서버에서 daemon이 상시 구동 중이어야 동작합니다.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input type='file' accept='.xlsx' onChange={handleFileChange} disabled={status === 'loading'} />
        {fileName && status === 'ready' && (
          <span style={{ color: '#888', fontSize: 12 }}>현재 표시 중: {fileName}</span>
        )}
      </div>

      {status === 'loading' && <p>업로드 및 daemon import 중... (파일 크기에 따라 다소 걸릴 수 있습니다)</p>}
      {status === 'error' && <p style={{ color: 'crimson' }}>오류: {errorMsg}</p>}

      {viewerUrl ? (
        <iframe
          src={viewerUrl}
          style={{ width: '100%', height: '80vh', border: '1px solid #ddd' }}
          title='Univer daemon 뷰어'
        />
      ) : (
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
