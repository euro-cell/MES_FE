# Univer 검증 노트 (IQC Proto2 / Proto3)

> IQC 검사 엑셀(xlsx, 이미지·차트 포함)을 브라우저에서 열람하는 화면을 만들기 위해
> Univer 패키지를 검증한 기록. 결론과 근거를 남겨 다음 판단에 참고한다.

## 구조 요약 (2026-09-04 기준, Proto/Proto2 삭제 후 번호 재배치됨)

| 화면 | 방식 | 상태 |
|---|---|---|
| IQC Proto2 (옛 Proto3) | 백엔드가 Univer CLI **daemon**에 xlsx를 import하고, daemon이 서빙하는 뷰어를 iframe으로 임베드 | 기능적으로 완성, 라이선스 워터마크도 해결됨. 다만 신버전 SDK 채택 이후 적극 사용은 보류 |
| IQC Proto3 (옛 Proto4) | 신버전 SDK(`@univerjs/preset-sheets-advanced@1.0.0-beta.2`)로 메인 앱 npm 트리에서 브라우저 단독 렌더링(iframe/pnpm 격리 없음) | **현재 채택된 방향**, 실사용 전환 완료 |

> 삭제됨: 최초 프로토타입 `IQC Proto`(오픈소스 SDK, 차트 미지원)와 DB 워크북
> 방식이던 옛 `IQC Proto2`, IQC 검사 화면의 원본 엑셀 첨부(`WorkbookAttachment`)
> 기능. 전부 구버전 SDK(`0.25.1`)를 썼던 코드라, 신버전으로 npm 트리를 통일하며
> 함께 제거함 — 자세한 경위는 "신버전 SDK 실제 채택" 섹션 참조.

## 왜 daemon iframe(Proto3)으로 갔는가

- 오픈소스 SDK(Proto/Proto2 경로)에는 차트 기능이 없다. 차트를 쓰려면 `@univerjs-pro/*` 계열
  패키지(`preset-sheets-advanced` 등)가 필요한데, 여기에는 상용 라이선스 워터마크
  ("Univer Pro License Required")가 뜬다. `latest`(0.25.1), `insiders`(1.0.0-insiders) 태그
  둘 다 동일하게 워터마크가 확인됨.
- 반면 Univer CLI의 `daemon` 모드(`univer daemon start`, 로컬 게이트웨이 기본 포트 9123)가
  서빙하는 뷰어는 **동일한 차트 데이터를 워터마크 없이** 렌더링한다. Univer 측(Discord DM,
  Stan)에 문의한 결과, 브라우저 SDK가 아니라 **CLI 자체가 "무료 상업적 이용" 대상**이라는
  것이 핵심이었다.
- CLI daemon 뷰어를 `<iframe>`으로 다른 오리진 페이지에 임베드해도 `X-Frame-Options`/CSP
  `frame-ancestors` 제약이 없어 정상 렌더링됨을 직접 확인(Chrome DevTools로 크로스 오리진
  iframe 테스트).
- daemon 뷰어는 기본적으로 **읽기 전용**이다(사람이 직접 셀 편집 시도 시 "해당 범위는
  보호되어 있어 편집 권한이 없습니다" 경고). IQC 열람 화면은 편집이 필요 없으므로 문제가
  되지 않는다 — 오히려 딱 맞는 제약.

## 라이선스 방향 (Univer 측 Discord 답변 요약)

- Univer Pro는 상용 제품으로서는 더 이상 판매/유지되지 않음. 예전 Pro 기능(차트, 피벗 등)은
  이제 **Univer CLI**를 통해 제공되고, 처음엔 상업적 이용 포함 무료.
- 향후 유료화하더라도 차트/피벗/뷰어 같은 "기능 단위 게이팅"이 아니라 **"동시 협업 규모"
  기준**이 될 가능성이 높다고 안내받음. 우리는 동시 편집자가 많지 않은 시나리오(단일 사용자
  조회 위주)라 이 기준으로도 안전한 축.
- 브라우저 SDK(`@univerjs-pro/*`)는 별개로, CLI의 "무료 상업적 이용" 발표와 무관하게 여전히
  라이선스 게이트가 걸려 있음(워터마크로 실측 확인).
- (2026-08-11 기준) Univer가 "Univer Office Harness for Agents"라는 이름으로 CLI를 정식
  제품으로 런칭. 핵심은 (1) 스프레드시트/문서/슬라이드/캔버스 등을 한 런타임에 통합,
  (2) 오피스 파일을 에이전트가 이해·조작 가능한 구조화 코드로 변환, (3) worktree 기반
  멀티 에이전트 협업. 브라우저 SDK는 "아직 활발히 작업 중"이며 출시일 미정 — 대신 지금은
  CLI를 계속 쓰라고 공식 권장. 우리가 이미 하고 있는 daemon iframe 방식이 이 권장과 일치함.

## 검증된 재현 정확도

- 표/셀 서식/병합/색상: 정상 재현.
- 이미지(PNG/JPEG, 셀 앵커 포함): 정상 재현. 실제 IQC 파일(FE-SEM 그래프, PSD 그래프,
  Al-Tab 모식도면 등)로 확인.
- **EMF 이미지**: (2026-08-24 당시) 재현되지 않는 것으로 확인했었으나, **(2026-08-31
  재확인, 신버전 SDK) 실제로는 렌더링된다** — 다만 아래 "이미지 스케일 버그"에서
  설명하는 크기 문제가 있음. 예전 판단이 부정확했던 것으로 정정.
- **PDF 첨부(OLE 임베디드 객체, 예: "패키저 셸 개체"로 삽입된 문서, 수식은
  `=EMBED("Packager Shell Object","")`)**: 여전히 재현되지 않음(아이콘조차 안 뜸).
  (2026-08-31) 순수 Univer daemon 뷰어(우리 코드 전혀 안 거침, `univer open`으로
  받은 URL을 직접 염)에서도 동일하게 재현됨을 확인 — Proto3(신버전 SDK)만의 문제가
  아니라 CLI/daemon 공통 한계로 보임. Stan에게 리포트 완료, 재현용 redacted 샘플
  파일도 전달.
- **이미지 스케일 버그** (2026-08-31 발견, 신버전 SDK): 실제 IQC 파일(`IQC Data
  Sheet_양식_V1(rev.1)_250926.xlsx`, 음극재 시트)에서 이미지가 원본보다 훨씬 작게
  렌더링되어 앵커 영역 안에 여백이 크게 남는 현상 확인. 원인 분석: 해당 도형들이
  `twoCellAnchor editAs="oneCell"`(위치만 셀 범위로 앵커, 실제 렌더 크기는
  `xfrm/ext`의 고정 EMU 값을 따라야 함)로 저장되어 있는데, CLI import가 이
  `editAs` 속성을 무시하고 앵커 셀 범위 전체를 렌더 프레임으로 취급하는 것으로
  보임(이 파일에 이렇게 앵커된 도형 45개, 전부 동일 증상). Stan에게 리포트 완료,
  redacted 샘플 파일 전달.
- 차트:
  - Column(막대), Pie(파이), Line(선): CLI `execute`로 Facade API(`newChart` →
    `insertChart`)를 통해 생성 시 daemon 뷰어에서 정상 렌더링.
  - Scatter(산점도): 처음엔 렌더링 실패("계열을 추가하여 데이터 시각화를 시작하세요" 빈
    상태)로 보였으나, 원인은 **우리가 `FScatterChartBuilder` 전용 메서드
    `setScatterMapping({ xIndex, yIndex })` 호출을 빠뜨린 것**이었다. 이걸 추가하니
    `execute`로 만든 산점도는 정상 렌더링됨.
  - 다만 **`univer import`로 xlsx를 가져올 때는 원본의 네이티브 산점도 차트(예:
    정규분포 곡선)가 여전히 빈 상태로 남는다** — import가 생성하는 차트 데이터의
    `context`에 `scatterMapping` 필드가 채워지지 않는 것으로 확인(`categoryIndexes: []`,
    `seriesIndexes: [0, 1]`만 있고 `scatterMapping` 없음). 이건 우리 실수가 아니라
    **CLI `import`가 엑셀 네이티브 산점도를 변환하는 로직의 공백**으로 보임. 실제 OQC
    검사 파일(`OQC Data Sheet_NAD26F2-TNP37_260806.xlsx`)의 "Standard Capacity 정규분포"
    등 다수 차트가 이 케이스에 해당해 여전히 빈 화면으로 나옴. Stan에게 공유 예정/공유함.
- 폰트: 원본 xlsx가 테마 폰트(`scheme="minor"`)로 지정한 한글 폰트(예: 맑은 고딕)가,
  CLI import 시 스크립트별 매핑(`Hang`→맑은 고딕)이 아니라 라틴 기본값(`Aptos Narrow` 등)
  으로 잘못 치환되는 버그를 발견. 브라우저 폰트 폴백에 따라 화면에 等线(중국어 기본
  산세리프)로 보이는 경우도 있었음. 급한 이슈가 아니라 리포트는 보류.
  - (2026-08-28 재확인, Proto3/신버전 SDK) 실제 OQC 파일 응답을 까봐서 실측: 워크북
    `styles`에 `_fontScheme: "minor"`인 스타일이 220개 있는데 전부 `ff: "Aptos Narrow"`로
    잘못 들어가 있고, 정확히 `ff: "맑은 고딕"`으로 저장된 건 스타일이 원본에서 폰트를
    직접(테마 아님) 지정한 62개뿐이었음. 즉 CSS 폰트 폴백으로 해결 가능한 문제가 아니라
    (셀 스타일 데이터 자체에 잘못된 폰트명이 박혀 있음) CLI import 버그가 원인이라는 게
    다시 확인됨. 신버전 SDK로 바뀌어도 이 버그는 그대로 재현됨(CLI 쪽 문제라 SDK 버전과
    무관).

## 서버 배포 (2026-08-20)

로컬 daemon 검증 이후 실제 배포 환경(Docker + nginx, blue-green)까지 daemon iframe을
연결하면서 여러 겹의 문제를 겪고 순서대로 해결함. 관련 코드는 전부
`eurocell-mes-be`의 `src/common/middleware/univer-viewer-proxy.middleware.ts`와
`src/modules/quality/shared/univer-cli.service.ts`, 프론트의 `vite.config.ts`(로컬 dev 전용)에 있음.

1. **daemon이 컨테이너 루프백에만 바인딩**: `univer daemon start`는 `127.0.0.1:9123`에만
   붙어서 nginx(별도 컨테이너)가 직접 프록시할 수 없었음(502). daemon을 별도로 노출하는
   대신, daemon과 같은 컨테이너에 있는 **백엔드가 `/univer-viewer` 요청을 받아 내부적으로
   `127.0.0.1:9123`으로 릴레이**하는 프록시 미들웨어를 추가해서 해결.
2. **`univer open`의 `file://` 스킴 버그**: 다른 CLI 명령(import/status/execute)과 달리
   `open`만 `file://` URL을 인식하지 못하고 실행 프로세스의 cwd 기준 상대경로로 잘못
   해석함. `file://` 접두사 없이 순수 OS 절대경로를 넘기도록 우회(`UniverCliService.runOpen`).
3. **daemon 뷰어 URL이 `127.0.0.1` 기준으로 나옴**: daemon이 반환하는 뷰어 URL의 origin이
   `http://127.0.0.1:9123`이라, 브라우저가 그대로 열면 사용자 자신의 PC를 가리켜버림.
   `FRONTEND_ORIGIN` 환경변수를 재사용해 `${FRONTEND_ORIGIN}/univer-viewer${경로}`로
   재조립해서 반환하도록 수정(새 환경변수 도입 없이 기존 것 재사용).
4. **NestJS 미들웨어 라우팅 함정**: `forRoutes('univer-viewer*path')` 같은 이름 붙은
   와일드카드 패턴이 실제로는 전혀 매칭되지 않아 미들웨어 자체가 호출 안 됨
   → `forRoutes('*')`로 바꾸고 미들웨어 내부에서 직접 필터링. 그 다음, `forRoutes('*')`로
   등록된 미들웨어는 내부적으로 하위 라우터에 마운트되어 `req.path`가 항상 `'/'`로 찍히는
   것도 확인 → 반드시 `req.originalUrl` 기준으로 필터링해야 함.
5. **daemon HTML의 정적 리소스가 절대경로(`/assets/...`)**: 브라우저가 `/univer-viewer`
   접두사 없이 그대로 요청해서 SPA 폴백(index.html)이 응답 → MIME 에러
   (`Expected a JavaScript-or-Wasm module script`). HTML 응답을 가로채 `src=`/`href=`의
   절대경로를 `/univer-viewer` 접두사로 재작성.
6. **daemon의 JS 번들 자체도 `/uf/...`, `/assets/...`를 문자열로 하드코딩 호출**
   (동적 import, API fetch 등): HTML 재작성만으로는 못 잡음. **nginx에서 `/assets`를
   통째로 열면 프론트 자신의 빌드 결과물(`dist/assets/*.js`)과 경로가 겹쳐 프론트 화면이
   깨지는 위험**이 있어(실제로 확인됨) 그 방식은 폐기. 대신 **HTML뿐 아니라 JS
   응답 본문까지 가로채서** 같은 방식으로 절대경로 문자열을 재작성하도록 확장. 이 방식이면
   nginx는 `/univer-viewer` location 하나만 있으면 됨 (`/assets`, `/uf` 별도 location 불필요).
7. **daemon의 immutable 캐시 헤더로 재작성 결과가 캐싱 안 됨**: daemon이 정적 자산에
   `Cache-Control: public, max-age=31536000, immutable`을 붙이는데, 이걸 그대로 브라우저에
   전달하면 배포 후에도 브라우저가 예전(재작성 안 된) 캐시를 계속 씀. 재작성 대상 응답에는
   `Cache-Control: no-store`를 강제하고 `etag`를 제거해서 해결. (디버깅하며 이 문제를
   "배포가 안 됐다"로 착각하고 한참 헤맴 — 실제로는 코드/배포 다 정상이었고 브라우저
   캐시만 문제였음. 컨테이너 안에서 `curl`로 직접 응답을 확인해서 서버 사이드는 문제
   없다는 걸 먼저 확정한 뒤에야 캐시라는 걸 알아챔.)
8. **일부 동적 import 청크가 400 Bad Request**: 브라우저가 보낸 요청 헤더
   (`req.headers`)를 통째로 daemon에 전달하면서, daemon이 거부하는 조건부/부분요청 헤더
   조합(추정: Range, If-None-Match 등)이 섞여 특정 청크 요청만 실패. 필요한 헤더만
   화이트리스트로 선별해서 전달하도록 수정.

**교훈**: daemon 프록시 디버깅은 브라우저 콘솔/네트워크 탭만 보고 판단하지 말고,
반드시 **컨테이너 안에서 `curl`/`node -e`로 nginx→백엔드→daemon 각 구간을 하나씩
직접 찔러서** 어느 레이어까지 정상인지 확정한 다음 좁혀나가는 게 훨씬 빠르다. 이번에도
브라우저 캐시 때문에 "배포가 안 됐다"고 여러 번 오판할 뻔했다가, 컨테이너 내부 curl로
서버 사이드가 이미 정상이라는 걸 먼저 확인하고 나서야 원인을 좁혔다.

이후 배포 환경에서 추가로 발견/수정한 프록시 버그 (같은 미들웨어 파일):

9. **`req.headers`를 통째로 전달하면서 값이 `undefined`인 헤더가 섞여 500 에러**:
   `Invalid value "undefined" for header "accept"` — Node의 `http.request`는 헤더 값이
   `undefined`면 예외를 던진다(브라우저가 `accept` 등을 안 보내는 요청, 특정 동적 import
   에서 발생). 값이 실제로 존재하는 헤더만 골라 담도록 수정.
10. **슬래시 없는 상대경로 재작성 시 이중 슬래시 버그**: Vite의 `__vite__mapDeps`/
    `preload-helper`는 상대경로 문자열(`"assets/xxx.js"`, 슬래시 없음)을 받아 내부적으로
    `'/' + e`로 절대경로화하는 하드코딩된 로직을 쓴다(`import.meta.url`이나 `<base>`
    태그는 전혀 참조하지 않음 — `<base href="/univer-viewer/">` 삽입 시도는 그래서 효과
    없었고 롤백함). 이 상대경로 문자열을 `/univer-viewer/assets/...`(슬래시로 시작)로
    바꾸면 최종적으로 `'/' + '/univer-viewer/...'` = `//univer-viewer/...`(슬래시 2개,
    `ERR_NAME_NOT_RESOLVED`)가 되어버림. `univer-viewer/assets/...`(슬래시 없이)로 바꿔야
    그 `'/'+` 연산 후 정확한 경로가 나온다.
11. 위 9, 10을 겪으며 `./ko-KR-xxx.js` 같은 **진짜 상대경로 동적 import**(점-슬래시로
    시작, ESM 네이티브 문법)는 건드리지 않아야 한다는 것도 확인 — 이건 그 import를
    실행하는 모듈 자신의 로드 URL을 기준으로 브라우저가 알아서 해석하므로, 메인 스크립트
    (`human-*.js`)만 `/univer-viewer/assets/...`로 정확히 로드되면 문제없이 따라온다.

## 워터마크 근본 원인 확정 (Univer 측 확인, 2026-08-20)

- 로컬(`127.0.0.1`) 직접 접속은 워터마크 없음, 배포 서버의 사설 IP(회사 공유기망,
  `192.168.x.x`)로 프록시하면 동일한 daemon·동일한 파일인데도 워터마크가 뜨는 현상을
  실측으로 확인. 브라우저 JS를 리버싱해서 `x-univer-host` 헤더가 `{ time,
  domain: location.domain }`을 서명해 매 API 호출마다 보낸다는 것까지 확인.
- Univer(Stan)에게 문의한 결과 **공식적으로 확인됨**: "자체 도메인을 쓰면 워터마크가
  뜨는 게 맞는 동작이고, 로컬에서는 뜨면 안 된다"고 확인. 이건 **CLI가 예전 Univer Pro
  SDK 코드베이스 위에 만들어져 있어서, SDK 시절부터 있던 도메인 검증 로직을 그대로
  물려받은 것**이라고 설명함. 즉 우리 쪽 프록시/설정 문제가 아니라 CLI의 의도된(그러나
  안내되지 않았던) 라이선스 동작이었음이 확정.
- **1개월짜리 임시 라이선스를 제공받기로 함** (요청 완료, 발급 대기 중). 필요시 연장
  요청 가능하다고 안내받음.
- Univer 측이 우리 사용 사례(제품/요구사항/통합 방식)에 관심을 보여 공유함: 여러 팀에
  흩어진 xlsx를 통합 관리하는 사내 시스템, 기본 읽기 전용이되 필요시 단일 사용자 편집
  가능(동시 편집 없음), 지금은 daemon+iframe이지만 정식 SDK 출시되면 전환 예정.
- (2026-08-20 기준) Univer가 "다음 주 정식 SDK 출시, 더 개발자 친화적"이라고 재확인.
  지난 예고("다음 주 SDK")가 실제로는 CLI 정식 런칭(Office Harness)으로 나왔던 전례가
  있어 이번에도 일정이 그대로 지켜질지는 불확실 — 임시 라이선스로 지금 구조를 유지하며
  기다리는 쪽으로 결정.

## 라이선스 발급 후에도 워터마크 해결 실패 (2026-08-21 ~ 08-24)

- 이메일로 `license.zip` 수신. 안에 `license.txt`(`<id>-1-<base64 JSON payload>-<서명>-
  <타임스탬프>` 형태의 긴 서명 토큰, payload를 디코딩해 `dm: ["192.168.0.164",
  "192.168.0.41"]`로 두 IP가 정확히 포함된 것 확인)와 `licenseKey.txt`(훨씬 짧은
  랜덤 문자열) 두 파일이 있었음. 어느 값을 `univer config set univerRuntime.license`에
  넣어야 하는지 CLI 문서에 안내가 없어 Stan에게 크로스체크 질문 → "license.txt 맞다"
  확인받음.
- 그런데도 `192.168.0.41`(사설 IP) 경유 접근 시 워터마크가 계속 재현됨. 다음 조합을
  전부 시도했지만 전혀 해소 안 됨:
  - `license.txt` 값 / `licenseKey.txt` 값 각각 단독으로 설정
  - CLI 0.4.3 / 0.4.4(Stan이 "워터마크 관련 fix"라며 안내한 버전) 양쪽
  - 매 시도마다 `univer daemon stop && start`로 재기동, 새 worktree로 캐시 영향 배제
  - Sheet 파일뿐 아니라 Doc 파일(`.docx`)로도 동일하게 재현 — 파일 종류는 원인이 아님
- 값 자체가 정확한지 직접 검증: `univer config get`으로 저장값이 원본과 바이트 단위로
  일치함을 확인. 0.4.4 daemon이 서빙하는 JS 번들도 직접 까봄 — 도메인 검증 로직
  (`{ time, domain: location.domain }`을 서명해 `x-univer-host` 헤더로 보내는 것)은
  0.4.3과 완전히 동일하게 남아있었고, 그 서명에 쓰는 키를 `window.__Key__`에서
  읽어오는데 daemon이 서빙하는 HTML 어디에도 그 값을 주입하는 코드가 없다는 것까지
  확인함 — 즉 서버가 설정한 라이선스가 브라우저 쪽으로 아예 전달되지 않는 것으로 보임.
  이 분석을 Stan에게 전달했으나, Stan이 직접 재현했을 때는 "no issue"라는 답변과 함께
  스크린샷(Doc 파일 열람 화면, 워터마크 없음)을 보내옴 — 포트가 9124였던 점, UI가
  Sheet가 아니라 Doc 레이아웃이었던 점을 근거로 "다른 실행 방식 아니냐"고 되물었으나,
  이후 스스로 재확인해보니 **Doc과 Sheet는 원래 UI 레이아웃이 다른 게 정상**이고
  포트도 daemon이 임의로 잡는 값이라 이 두 근거는 무효였음(성급한 추측이었고, 실제로
  우리 쪽에서도 Doc 파일로 재현해보니 이 환경에서는 Sheet와 동일하게 워터마크가 뜸).
  최종적으로는 "값 일치 확인, 재현 스크린샷(버전/설정/워터마크 한 화면)"만 사실로
  남기고 그 이상의 추측은 보내지 않는 방향으로 정리함.
- **교훈**: 벤더에 보내는 원인 분석 메시지에 "~로 보인다", "~것 같다" 수준의 추측
  (예: 포트 차이, UI 차이)을 근거로 세우면, 나중에 그 추측이 틀렸을 때 정정하는 비용이
  더 크다. 실측 사실(값 일치 여부, 버전, 재현 스크린샷)과 추측을 분리해서, 확실한 것만
  먼저 전달하는 게 더 빠르게 수렴한다.

## SDK 대기로 결정 (2026-08-24)

- Stan이 "SDK가 이번 주(1~2일 내) 출시 예정"이라고 안내하며, daemon 워터마크 버그를
  계속 팔지 SDK를 기다릴지 물어옴.
- daemon 라이선스 워터마크 원인이 여러 차례 시도에도 해소되지 않았고, 이 daemon
  iframe 구조는 애초에 "SDK 정식 출시 전까지의 임시 방편"으로 시작한 것이었으므로,
  **SDK 출시를 기다리기로 결정**. 계속 daemon 버그를 파고드는 것보다 새 SDK로 바로
  통합하는 게 더 합리적이라고 판단.
- 단, "다음 주 SDK"라는 예고가 과거에도 있었고 그때는 실제로 CLI 정식 런칭(Office
  Harness)으로 나왔던 전례가 있어, 이번 일정도 정확히 지켜질지는 불확실.

## 워터마크 진짜 원인 발견: 우리 쪽 프록시 설정 누락 (2026-08-24)

- SDK 대기로 결정한 뒤, Stan의 엔지니어가 "daemon 뷰어가 실제로 라이선스 config를 받고
  있는지 DevTools Network에서 `runtime-config` 요청의 `license` 필드를 확인해달라"고
  재요청. 이전까지는 "CLI의 의도된 도메인 검증 로직" 자체를 의심했지만, 이번엔 뷰어가
  라이선스 값을 실제로 *받고 있는지*를 짚은 것이 결정적이었다.
- 검증 순서:
  1. `127.0.0.1:9123/runtime-config`에 직접 요청 → `license` 필드 정상 포함.
  2. `192.168.0.41/univer-viewer/runtime-config`(프록시 접두사 포함 경로)로 curl →
     역시 정상.
  3. 그러나 브라우저에서 실제 daemon 뷰어를 열고 DevTools Network(XHR/fetch)를 보니,
     daemon 클라이언트 JS가 실제로 호출하는 요청은 `GET http://192.168.0.41/runtime-config`
     — **`/univer-viewer` 접두사 없이** 나가고 있었다. 다른 모든 daemon 요청(`/univer-viewer/uf/...`)
     과 달리 이 요청만 예외적으로 절대경로 루트를 호출하는 방식.
  4. 이 경로가 `univer-viewer-proxy.middleware.ts`의 `DAEMON_NATIVE_PATH_PREFIXES`
     (`['/assets/', '/uf/']`)에 없어서 프록시를 그냥 통과(`next()`)했고, 결국 프론트
     서버(Vite dev / 배포 시 프론트 컨테이너)가 자신의 SPA 폴백(`index.html`)으로
     응답하고 있었다. 실제로 이 요청의 응답을 확인해보니 `content-type: text/html`에
     유로셀 MES 앱의 `index.html`(React Refresh 스크립트, `/src/main.tsx` 등)이 그대로
     찍혀 있었다 — JSON도 아니고 daemon 응답도 아니었다.
  5. 즉 daemon과 백엔드 프록시 자체는 (curl로는) 항상 정상적으로 license를 반환했지만,
     **브라우저의 실제 클라이언트 JS는 이 요청 경로가 프록시 화이트리스트에서 빠져 있어
     license 값을 한 번도 전달받지 못하고 있었다.** 이게 몇 주간 워터마크가 계속
     재현된 진짜 원인이었다 — CLI의 "의도된 도메인 검증"이 원인이 아니라, 우리 쪽
     프록시 설정 누락이었다.
- 수정: `DAEMON_NATIVE_EXACT_PATHS = ['/runtime-config']`를
  `univer-viewer-proxy.middleware.ts`에 추가(접두사 매칭이 아니라 정확히 일치하는
  단일 전역 엔드포인트라 별도 처리), 로컬 `vite.config.ts`에도 동일하게
  `/runtime-config` 프록시 규칙 추가.
- 로컬 dev 환경에서 먼저 재검증: 백엔드/프론트 dev 서버 재기동 후 daemon 뷰어를 다시
  열어 `/runtime-config` 요청을 확인 — `content-type: application/json`,
  `x-powered-by: Express`로 daemon 자체 응답이 정상적으로 오고, 응답 본문에 실제
  `license` 값(1개월 임시 라이선스 토큰)이 포함됨을 확인. 화면에도 워터마크가 사라짐을
  확인.

### 배포 환경까지 반영 (2026-08-24)

- 배포 환경(Docker+nginx blue-green)에 `UNIVER_LICENSE` 환경변수를 설정하고 코드를
  배포했는데도 워터마크가 계속 떠서 추가로 원인을 좁혔다. 순서대로 확인:
  1. `docker exec`로 백엔드 컨테이너(`eurocell-mes-be-blue`)에 접속해 `printenv
     UNIVER_LICENSE`, `univer config get univerRuntime.license --json` 모두 정상
     값 확인 → 환경변수 주입과 config 반영 자체는 문제없었음.
  2. `univer daemon status --json`도 `running` 정상.
  3. 컨테이너 안에서 `node -e "http.get('http://127.0.0.1:9123/runtime-config', ...)"`
     로 daemon에 직접 요청 → **"Not found"**. daemon 자체가 이 엔드포인트를 모르고 있었다.
  4. `univer --version` 확인 → 배포 컨테이너는 **0.4.0**, 로컬 PC는 **0.4.4**. 원인은
     `Dockerfile`의 `RUN npm install -g univer-cli`가 버전을 고정하지 않아서, 이미지가
     처음 빌드됐을 때의 `latest`(0.4.0)가 캐시된 레이어에 그대로 굳어 있었던 것. 로컬은
     그 사이 별도로 CLI를 업그레이드해서 0.4.4였고, `runtime-config` 엔드포인트는 0.4.4
     이후에 추가된 기능이라 0.4.0에는 아예 없었다.
  5. `Dockerfile`에서 `univer-cli@0.4.4`로 버전 고정.
  6. 그런데 브라우저에서 직접 `http://192.168.0.164/runtime-config`를 열어보니 **200
     OK인데 응답이 유로셀 MES 프론트 앱의 `index.html`**이었다 — 로컬 dev에서 겪었던
     것과 동일한 증상. nginx conf를 확인해보니 **`location /univer-viewer/`만
     백엔드로 프록시하고, 그 외 전부(`location /`, `/runtime-config` 포함)는 프론트
     컨테이너로 가도록** 되어 있었다. 즉 백엔드 미들웨어 코드가 아무리 `/runtime-config`
     를 처리하도록 고쳐도, **nginx 단계에서부터 이 요청이 백엔드로 전달되지 않고
     있었던 것**이 배포 환경에서의 진짜 원인.
  7. nginx conf에 `location = /runtime-config { proxy_pass
     http://eurocell-mes-be-active:8080/runtime-config; ... }`를 `/univer-viewer/`와
     같은 프록시 헤더 설정으로 추가하고 리로드 → 브라우저에서 `/quality/iqc-proto3`
     화면을 다시 열어 워터마크 없이 정상 렌더링됨을 최종 확인.
- **정리하면 원인은 두 겹이었다**: (1) `Dockerfile`이 `univer-cli` 버전을 고정하지
  않아 배포 이미지가 `runtime-config`를 지원하지 않는 구버전(0.4.0)에 머물러 있었던
  것, (2) 설령 버전이 맞아도 nginx conf에 `/runtime-config` location이 없어서 이
  요청이 애초에 백엔드까지 도달하지 못했던 것. 로컬 dev에서 겪은 문제(Vite 프록시
  누락)와 증상은 같았지만 배포 환경에서의 실제 원인은 nginx 설정 쪽이었다.
- **결론**: 우리 쪽 인프라 설정(이미지 버전 고정 누락 + nginx 라우팅 누락) 두 가지가
  겹쳐서 라이선스가 브라우저까지 전달되지 못했던 것이 몇 주간 워터마크가 재현된 진짜
  원인이었다. CLI의 도메인 검증 로직 자체는 정상 동작이었고, Univer 측 문제가 아니었다.

## SDK Developer Preview 출시 안내 (2026-08-27)

- Stan이 SDK Developer Preview 출시를 안내(`https://office.univer.ai/llms.txt`),
  "이제 막 실험해볼 수 있는 단계이고 아직 다듬어지지 않은 부분이 있을 수 있다"는
  코멘트와 함께. 실제로 설치/실행해서 검증한 것은 아직 없음 — 직접 사용해보고
  판단 필요.
- (2026-09-04) Univer 팀이 이메일로도 동일한 소식을 정식 공지("Univer Office SDK"
  런칭, `office.univer.ai/getting-started`)로 재발송. 우리는 이미 아래 검증들을
  통해 실사용 전환까지 마친 상태라 특별한 조치 불필요, 참고만 함.

## 신버전 SDK 실제 채택: Proto2/Proto3 구조 정리 (2026-08-28)

Proto3(신버전 SDK) 심화 검증까지 문제없음을 확인한 뒤, **"SDK 대기" 결정을
번복하고 신버전 SDK를 실제로 메인 코드에 통합**하기로 했다. 다음 순서로 정리:

1. **완전 삭제**: 옛 `iqc-proto`(최초 프로토타입, 차트 미지원), 옛 `iqc-proto2`
   (DB 워크북 방식), IQC 검사 화면의 `WorkbookAttachment`(원본 엑셀 첨부·보관
   기능) — 백엔드 모듈/엔티티/컨트롤러, 프론트 화면/API 전부 삭제. DB 테이블은
   `synchronize`가 파괴적 동작(자동 DROP)을 하지 않는 것을 확인한 뒤 사용자가
   수동으로 정리하기로 함.
2. **번호 승격**: daemon iframe이던 옛 Proto3 → **Proto2**, 신버전 SDK이던 옛
   Proto4 → **Proto3**로 재배치(메뉴, 라우팅, 파일명, 클래스명 전부 변경).
3. **redi 중복 로드 충돌 재확인 및 근본 해결**: 신버전(`1.0.0-beta.2`)을 npm
   alias(`npm:@univerjs/...`)로 구버전(`0.25.1`)과 같은 트리에 설치했을 때
   `@univerjs-pro/*` 각 패키지가 `@univerjs/core`, `@wendellhu/redi`를 서로 다른
   물리 경로에 중복 설치(버전도 `redi@1.1.1` vs `1.1.2`로 달라 npm이 dedupe
   불가)해서 렌더링이 깨지는 것을 실측 확인 — 처음엔 `proto3-app/`을 별도 pnpm
   프로젝트로 완전히 격리하고 메인 앱에서는 iframe(`postMessage`)으로만 붙이는
   방식으로 우회했으나, **구버전 SDK를 쓰는 화면이 하나도 안 남을 때까지 전부
   정리하고 나니 신버전만 유일한 버전이 되어 npm이 정상적으로 단일화**할 수
   있게 됨(`@univerjs/core` 물리 설치 1개로 확인). 이후 iframe/pnpm 격리
   구조(`proto3-app/`)를 완전히 걷어내고 Proto3를 메인 앱 npm 트리에서 직접
   렌더링하도록 재작성.
4. 이 과정에서 실제 서비스 화면(`iqc/components/WorkbookAttachment.tsx`, IQC
   검사 항목의 원본 엑셀 첨부 기능)도 구버전 SDK를 쓰고 있던 것을 발견 —
   npm 단일 트리 통일을 위해 이 기능 자체를 삭제하기로 결정(사용자 지시).
5. 정리 후 재검증 과정에서 두 가지 새 버그를 더 발견:
   - `@univerjs/preset-sheets-core/lib/index.css` import 누락으로 리본/레이아웃
     전체가 깨지는 CSS 버그(우리 실수, 추가해서 해결).
   - `preset-sheets-advanced`가 `preset-sheets-core`/`preset-sheets-drawing`과
     달리 자체 로케일(`preset-sheets-advanced/locales/*`)을 명시적으로
     병합해주지 않으면, 차트 타입 드롭다운 등에 `sheets-chart-ui.chartTypes.column`
     같은 i18n 키 원문이 그대로 노출되는 버그 발견. `mergeLocales`에 추가해서
     해결(우리 쪽 코드 수정만으로 해결 가능했지만, 문서화 누락으로 판단해
     Stan에게도 리포트).

## 남은 과제

1. **daemon iframe 코드는 삭제하지 말고 보존**: `eurocell-mes-be`의
   `univer-viewer-proxy.middleware.ts`, `univer-cli.service.ts`의 daemon 관련 부분,
   프론트의 `vite.config.ts` 로컬 프록시 설정. SDK가 늦어지거나 기대에 못 미치면
   이 경로로 다시 돌아올 수 있다.
2. **인증 연동**: daemon 뷰어 자체엔 인증이 없음. 지금은 백엔드의 `SessionAuthGuard`가
   업로드 API(`/quality/iqc-proto3/upload`)만 보호하고, 일단 뷰어 URL을 발급받으면 그
   URL 자체는 인증 없이 열람 가능한 구조. daemon 경로를 실사용하게 되면 검토 필요.
3. **CLI 자체 버그 2건**: 산점도 import 시 `scatterMapping` 누락, 폰트 테마(`scheme="minor"`)
   매핑 오류. 전자는 Univer 측에 공유했고 엔지니어링팀에 전달됐다는 답변을 받음. 후자는
   급한 이슈가 아니라 리포트 보류 중. 둘 다 우리 쪽에서 우회할 방법은 없음(원인이 CLI 내부).
4. SDK가 나오면 이번에 겪은 문제들(도메인 워터마크, daemon 프록시의 여러 우회 로직)이
   얼마나 해소되는지, 그리고 편집 가능 여부/인증 연동이 SDK에서는 어떻게 되는지 재검토.

## 결론 / 다음 행동 (2026-09-04 기준 최신)

- **daemon(현 Proto2)**: 표/이미지/대부분 차트 정상, 프록시 버그 전부 수정,
  라이선스 워터마크 문제도 원인 규명 및 로컬/배포 환경 모두 해결 확인 —
  기능적으로 실사용 가능한 상태로 완성됐으나, 신버전 SDK로 갈아탄 이후로는
  daemon 경로 코드를 보존만 하고 적극적으로 쓰지 않는 쪽으로 방향이 바뀜.
- **신버전 SDK(현 Proto3, `@univerjs/preset-sheets-advanced@1.0.0-beta.2`)로
  실제 전환 완료**: "SDK 출시를 기다리겠다"던 이전 결정을 번복하고, 검증이
  끝난 신버전 SDK를 메인 앱 npm 트리에 직접 통합했다. 이 과정에서 구버전
  SDK를 쓰던 다른 화면(옛 Proto, 옛 Proto2, IQC 검사 화면의 원본 엑셀 첨부
  기능)을 전부 정리해서 npm 단일 트리로 통일했고, redi 중복 로드 충돌
  문제도 구버전을 완전히 제거함으로써 근본적으로 해소됨.
- 신버전 SDK로 넘어오면서 CSS 누락(우리 실수), 로케일 미병합(문서화 누락),
  이미지 스케일 버그(`editAs="oneCell"` 무시), OLE 미표시(daemon에서도
  동일 재현, CLI 공통 문제) 등을 추가로 발견·정리했고, 후자 셋은 Stan에게
  민감정보 제거 샘플 파일과 함께 리포트 완료(2026-08-31, Stan이 "엔지니어가
  살펴보겠다"고 회신, 진행 상황 확인 대기 중).
- 남은 CLI 자체 버그: 산점도 import 시 `scatterMapping` 누락, 폰트 테마
  매핑 오류(둘 다 Stan에게 리포트 완료), OLE 미표시, 이미지 스케일 버그.
  전부 우리 쪽에서 우회할 방법 없이 CLI/SDK 쪽 수정을 기다려야 하는 항목들.
- 인증 연동은 여전히 미검토 상태(daemon 뷰어/신버전 SDK 화면 모두 뷰어
  자체엔 별도 인증 없음, 업로드 API만 세션 가드로 보호).

## Proto3(신버전 SDK) 심화 검증 (2026-08-28)

Proto2/Proto3 정리 후, Proto3(iframe 없이 npm 단일 트리로 직접 렌더링)가 실사용
전환에 문제없는지 세 가지를 추가로 확인했다.

1. **이미지(drawing) 렌더링**: 실제 IQC 파일(`IQC Data Sheet_UFC-L37B_V5.10
   (NAE26E1-TNP37)_260529.xlsx`)로 확인. 이 파일에는 PSD 그래프, Half cell
   충방전 그래프가 셀에 이미지로 삽입되어 있는데, 좌우 두 컬럼(측정값/Reference)
   모두 정상 렌더링됨. `UniverSheetsDrawingPreset()`을 preset 목록에 추가해둔
   덕분(이전에 UI 레이아웃 버그를 고치며 이미 추가함).
2. **차트 종류별 렌더링**: Column(기존 확인)에 이어 Pie, Line을 Facade API
   (`newChart` → `insertChart`)로 직접 삽입해서 확인. 처음엔 텍스트 셀(예:
   "등급"/"내용" 헤더)을 소스 범위로 잡아 "Add a series to start visualizing
   your data"(빈 상태)가 떴는데, 원인은 소스 범위가 숫자 데이터가 아니었던
   것 — 실제 숫자 컬럼(예: 기준용량 Ave/Max/Min/Stdev)으로 범위를 바꾸니 Pie
   (범례/라벨/색상 정상), Line 둘 다 정상 렌더링됨. Univer 자체의 문제가 아니라
   테스트 스크립트의 소스 범위 실수였음.
3. **다중 파일 전환(메모리 누수 확인)**: 같은 화면에서 OQC → IQC → OQC로
   연속 3회 파일을 갈아끼우면서 `document.querySelectorAll('canvas').length`
   (항상 3개로 유지, 누적 안 됨)와 `performance.memory.usedJSHeapSize`(약
   270~286MB 사이에서 완만히 오르내림, 급격한 누적 증가 없음)를 확인. 콘솔
   에러도 매 전환마다 없었음. `renderWorkbook`이 매번 `univer.dispose()`
   호출 후 `container.innerHTML = ''`로 정리하고 새로 `createUniver`하는
   방식인데, 이게 제대로 동작하는 것으로 보임.

세 가지 모두 문제없이 확인되어, Proto3(신버전 SDK) 구조가 daemon(Proto2)을
대체할 실사용 후보로서 기능적 결함이 없음을 추가로 확인했다. 남은 것은 여전히
CLI 자체 버그(산점도, 폰트 매핑)뿐이며 이건 SDK를 어느 쪽으로 쓰든 동일하게
남는 문제다.
