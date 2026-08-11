import { useState } from 'react';

/**
 * Univer CLI daemon 웹뷰어를 iframe으로 임베드하는 실험 화면.
 * 브라우저 SDK(preset-sheets-advanced) 경로는 Pro 라이선스 워터마크가 뜨지만,
 * daemon이 서빙하는 뷰어(univer open으로 얻는 URL)는 워터마크 없이 차트까지 렌더링됨을
 * 앞선 검증(로컬 daemon + Chrome DevTools 테스트)으로 확인했다. 이 화면은 그 뷰어를
 * iframe으로 감싸 우리 앱 안에 띄울 수 있는지 확인하는 목적의 임시 실험 화면이다.
 *
 * 지금은 daemon이 로컬(127.0.0.1:9123)에서만 떠 있으므로 이 화면도 로컬 개발 환경에서만
 * 동작한다. daemon을 서버에 상시 구동시키는 배포 방식은 별도 검증이 필요하다.
 * 편집은 daemon 뷰어가 기본적으로 읽기 전용이라 지원되지 않으며, IQC 열람 용도로는 문제없다.
 */
export default function IQCProto3Index() {
  const [viewerUrl, setViewerUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  const handleLoad = () => {
    setViewerUrl(inputUrl.trim());
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>IQC 프로토타입3 (Univer CLI daemon 뷰어 iframe 실험)</h2>
      <p style={{ color: '#666', fontSize: 13 }}>
        실제 서비스 메뉴가 아닙니다. Univer CLI daemon이 로컬(127.0.0.1:9123)에서 구동 중이어야 동작합니다.
        터미널에서 <code>univer open &lt;file.univer&gt; --worktree &lt;id&gt; --unit &lt;unitId&gt;</code>로 얻은
        뷰어 URL을 아래에 붙여넣으세요. 이 뷰어는 읽기 전용이며 워터마크 없이 차트까지 렌더링됩니다.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          type='text'
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          placeholder='http://127.0.0.1:9123/?file=...&worktree=...&unit=...'
          style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 6 }}
        />
        <button
          type='button'
          onClick={handleLoad}
          disabled={!inputUrl.trim()}
          style={{
            padding: '6px 14px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #2563eb',
            background: '#eff6ff',
            color: '#2563eb',
            cursor: inputUrl.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          뷰어 불러오기
        </button>
      </div>

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
          뷰어 URL을 입력하고 불러오세요
        </div>
      )}
    </div>
  );
}
