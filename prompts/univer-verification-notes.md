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

## 남은 과제 (Proto3를 프로덕션으로 가져가려면)

1. **서버 배포**: 지금은 로컬 daemon(`127.0.0.1:9123`)만 검증됨. 백엔드는 Docker
   (Debian slim, Univer CLI 이미지에 전역 설치됨) + nginx(blue-green 배포) 조합으로
   운영되는데, daemon을 컨테이너 안에서 상시 구동시키고 nginx로 프록시하는 설정은
   아직 하지 않음.
2. **인증 연동**: daemon 뷰어 자체엔 인증이 없음. 지금은 백엔드의 `SessionAuthGuard`가
   업로드 API(`/quality/iqc-proto3/upload`)만 보호하고, 일단 뷰어 URL을 발급받으면 그
   URL 자체는 인증 없이 열람 가능한 구조. 프로덕션에서는 이 URL 접근도 제한할지 검토 필요.
3. **CLI 자체 버그 2건**: 위 산점도 import 공백, 폰트 테마 매핑 버그. 둘 다 리포트했거나
   할 예정이며 우리 쪽에서 우회할 방법은 없음(원인이 CLI 내부).
4. `univer open` 명령이 다른 CLI 명령(import/status/execute)과 달리 `file://` 스킴을
   인식하지 못하고 실행 프로세스의 cwd 기준 상대경로로 잘못 해석하는 동작 차이가 있었음.
   `eurocell-mes-be`의 `UniverCliService.runOpen`에서 `file://` 없이 순수 OS 경로를
   넘기도록 이미 우회 처리함(수정 완료).

## 결론 / 다음 행동

- SDK 출시를 기다리지 않고 **지금의 CLI + daemon iframe 방식(Proto3)으로 계속 진행**하기로
  결정. 이미 완성도가 높고(표/이미지/대부분 차트 정상), 남은 결함(산점도 import, 폰트)은
  좁은 범위이며 CLI 쪽 개선을 기다리는 것 외에 우리가 당장 취할 조치는 제한적.
- 다음 단계는 서버 배포(위 "남은 과제" 1, 2번) 검증.
