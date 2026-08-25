# Eurocell MES Frontend

Eurocell 배터리 셀 제조 실행 시스템(MES)의 프론트엔드입니다.

## 기술 스택

- **Framework**: React 19 (TypeScript)
- **Build**: Vite 8
- **Routing**: React Router v7
- **서버 상태**: TanStack React Query v5
- **HTTP**: axios (쿠키 기반 세션 인증)
- **테이블**: TanStack React Table v8 + Virtual
- **차트**: Chart.js v4, react-chartjs-2, chartjs-plugin-annotation, chartjs-plugin-datalabels
- **엑셀 내보내기**: ExcelJS + file-saver
- **스프레드시트(IQC)**: Univer (`@univerjs/presets`, preset-sheets-core, preset-sheets-drawing)
- **PDF 뷰어**: react-pdf
- **날짜**: react-datepicker, date-fns
- **알림**: react-hot-toast
- **한/영 오타 변환**: hangul-js (한글 자모 분해 → 영문 자판 매핑)
- **한국 공휴일**: @hyunbinseo/holidays-kr
- **스타일**: CSS Modules

## 환경 설정

`.env.local` 파일을 생성하고 아래 항목을 채웁니다.

```env
VITE_API_BASE_URL=/api
VITE_API_TARGET=http://localhost:8000
# 백엔드가 /api 프리픽스 없이 라우팅하는 경우 true (프록시가 /api를 제거하고 전달)
VITE_API_REWRITE=true
```

## 실행

```bash
# 패키지 설치
npm install

# 개발 서버 (http://0.0.0.0:80)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트
npm run lint
```

## 모듈 구조

| 모듈        | 설명                                     |
| ----------- | ---------------------------------------- |
| `dashboard` | 분석 대시보드                            |
| `project`   | 생산계획, 자재, 규격, 작업일지, LOT 관리 |
| `quality`   | IQC / LQC / OQC 품질 관리                |
| `plant`     | 설비 및 유지보수 관리                    |
| `stock`     | 배터리 셀 재고 관리                      |
| `draw`      | 도면 및 버전 관리                        |
| `etc`       | 메뉴 접근 권한 관리                      |

## 인증

쿠키 기반 세션 인증을 사용합니다. 앱 로드 시 `/api/auth/status`로 인증 상태를 확인하며, 미인증 접근 시 `/login`으로
리다이렉트됩니다. 개발 환경에서는 Vite 프록시가 `/api` 요청을 `VITE_API_TARGET`으로 전달합니다.
