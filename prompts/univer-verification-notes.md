# Univer 검증 노트 (IQC Proto / Proto2 / Proto3)

> IQC 검사 엑셀(xlsx, 이미지·차트 포함)을 브라우저에서 열람하는 화면을 만들기 위해
> Univer 패키지를 검증한 기록. 결론과 근거를 남겨 다음 판단에 참고한다.

## 구조 요약

| 화면 | 방식 | 상태 |
|---|---|---|
| IQC Proto | 오픈소스 SDK (`@univerjs/preset-sheets-core` + `preset-sheets-drawing`)로 브라우저에서 직접 렌더링 | 최초 검증용, 차트 미지원 |
| IQC Proto2 | Proto와 동일한 SDK, 프로젝트 단위로 워크북을 RustFS에 저장 | 실사용에 가까운 형태로 발전 |
| IQC Proto3 | 백엔드가 Univer CLI **daemon**에 xlsx를 import하고, daemon이 서빙하는 뷰어를 iframe으로 임베드 | 차트 문제 해결을 위해 도입, **현재 권장 방향** |

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
- **EMF 이미지, PDF 첨부(OLE 임베디드 객체, 예: "패키저 셸 개체"로 삽입된 문서)**: 재현되지
  않음. 파일 포맷 자체의 한계로, Univer만의 문제가 아님(대부분의 xlsx 파서 공통 한계).
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

## 남은 과제

1. **라이선스 키 발급 후 적용 방법 확인 필요**: `univer config`에 `univerRuntime.license`
   라는 키가 있는 걸 확인해뒀음 (`univer config set univerRuntime.license <값>` 형태로
   추정) — 실제 키를 받으면 정확한 사용법을 다시 확인해야 함.
2. **인증 연동**: daemon 뷰어 자체엔 인증이 없음. 지금은 백엔드의 `SessionAuthGuard`가
   업로드 API(`/quality/iqc-proto3/upload`)만 보호하고, 일단 뷰어 URL을 발급받으면 그
   URL 자체는 인증 없이 열람 가능한 구조. 프로덕션에서는 이 URL 접근도 제한할지 검토 필요.
3. **CLI 자체 버그 2건**: 산점도 import 시 `scatterMapping` 누락, 폰트 테마(`scheme="minor"`)
   매핑 오류. 전자는 Univer 측에 공유했고 엔지니어링팀에 전달됐다는 답변을 받음. 후자는
   급한 이슈가 아니라 리포트 보류 중. 둘 다 우리 쪽에서 우회할 방법은 없음(원인이 CLI 내부).
4. 다음 주 예정된 정식 SDK가 나오면, 이번에 겪은 문제들(도메인 워터마크, daemon 프록시의
   여러 우회 로직)이 얼마나 해소되는지 다시 검토.

## 결론 / 다음 행동

- 임시 라이선스로 워터마크를 없애고, 지금 완성된 daemon iframe 구조(Proto3)를 그대로
  운영하면서 실사용 데이터로 검증을 이어가기로 함.
- 라이선스 키가 도착하면 적용 방법을 확인하고 실제로 워터마크가 사라지는지 재검증.
- 다음 주 SDK 출시 소식을 계속 지켜보고, 나오면 지금 구조 대비 이점이 있는지 비교.
