# 유로셀 MES 디자인 리뉴얼 프롬프트

## 목표

`src/styles/etc/users.module.css` 에 적용된 디자인 패턴을 기준으로
프로젝트 전체 CSS Module 파일들을 동일한 스타일로 리뉴얼한다.

---

## 백업 파일 관리

디자인 리뉴얼 작업 시 원본 파일은 프로젝트 루트의 `bak/{domain}/` 폴더에 저장합니다.

### 백업 파일 목록

#### etc (기타 - 메뉴 접근 관리)
작업 일자: 2026-04-21

- `bak/etc/permission.module.css.bak` — 메뉴 접근 관리 페이지 CSS
- `bak/etc/RolePermission.tsx.bak` — 직급별 권한 관리 컴포넌트
- `bak/etc/UserPermission.tsx.bak` — 사용자별 권한 관리 컴포넌트

복구 방법:
```bash
cp bak/etc/permission.module.css.bak src/styles/etc/permission.module.css
cp bak/etc/RolePermission.tsx.bak src/modules/etc/perm/RolePermission.tsx
cp bak/etc/UserPermission.tsx.bak src/modules/etc/perm/UserPermission.tsx
```

#### stock/cell/inOut (셀 입/출고)
작업 일자: 2026-04-23

- `bak/stock/cell/InOut.module.css.bak` — Cell 입/출고 CSS
- `bak/stock/cell/InOutForm.tsx.bak` — 입력 폼 컴포넌트
- `bak/stock/cell/InOutTable.tsx.bak` — 현황 테이블 컴포넌트
- `bak/stock/cell/InOutIndex.tsx.bak` — index 페이지

복구 방법:
```bash
cp bak/stock/cell/InOut.module.css.bak src/styles/stock/cell/InOut.module.css
cp bak/stock/cell/InOutForm.tsx.bak src/modules/stock/cell/inOut/InOutForm.tsx
cp bak/stock/cell/InOutTable.tsx.bak src/modules/stock/cell/inOut/InOutTable.tsx
cp bak/stock/cell/InOutIndex.tsx.bak src/modules/stock/cell/inOut/index.tsx
```

---

## 디자인 토큰 (기준값 — 변경 금지)

### 컬러
```
배경:         #f8fafc (페이지), #fff (카드/테이블)
보더:         #e2e8f0 (기본), #f1f5f9 (subtle)
텍스트:       #0f172a (제목), #1e293b (본문), #64748b (부제/라벨), #94a3b8 (placeholder/empty)

Primary:      #1d4ed8 (버튼), #1e40af (hover)
Danger:       #e11d48 (텍스트), #fff1f2 (bg), #fecdd3 (border)
Secondary:    #475569 (텍스트), #f1f5f9 (bg), #e2e8f0 (border/hover)

Badge 활성:   bg #dcfce7, text #16a34a
Badge 비활성: bg #fee2e2, text #dc2626

포커스 링:    border #3b82f6, shadow rgba(59,130,246,0.12)
```

### 타이포그래피
```
페이지 제목:  18px, font-weight 700, color #0f172a, letter-spacing -0.01em
테이블 헤더:  12px, font-weight 600, color #64748b, uppercase, letter-spacing 0.05em
테이블 본문:  14px, color #1e293b
폼 라벨:      12px, font-weight 600, color #64748b, letter-spacing 0.03em
모달 제목:    16px, font-weight 700, color #0f172a
```

### 간격 & 형태
```
페이지 패딩:  16px
카드 radius:  12px
모달 radius:  14px
입력 radius:  8px
버튼(소) radius: 6px
버튼(대) radius: 8px
테이블 셀 패딩: 12–13px 16px
```

### 그림자
```
테이블 카드:  0 1px 4px rgba(0,0,0,0.06)
모달:         0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)
모달 backdrop: rgba(15,23,42,0.5) + backdrop-filter: blur(2px)
```

---

## 컴포넌트 패턴

### 페이지 컨테이너
```css
.xxxContainer { padding: 16px; }
.xxxHeader {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.xxxHeader h2 { font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; }
```

### 테이블
- 테이블을 `.tableWrapper` (흰 카드, border, border-radius 12px, overflow hidden)로 감싼다
- `thead`: background `#f8fafc`, border-bottom `1px solid #e2e8f0`
- `th`: 12px uppercase, color `#64748b`
- `td`: border-bottom `1px solid #f1f5f9`, 마지막 행은 border 없음
- `tbody tr:hover`: background `#f8fafc`

### 버튼
| 종류 | 용도 | 스타일 |
|------|------|--------|
| btnPrimary | 추가/저장 | bg #1d4ed8, white, padding 8px 16px, radius 8px |
| btnSecondary | 수정/취소 | bg #f1f5f9, color #475569, border #e2e8f0, padding 5px 12px, radius 6px |
| btnDanger | 삭제 | bg #fff1f2, color #e11d48, border #fecdd3, padding 5px 12px, radius 6px |

### 배지
- 활성/승인/정상: `badgeActive` — bg #dcfce7, color #16a34a, radius 99px
- 비활성/반려/이상: `badgeInactive` — bg #fee2e2, color #dc2626, radius 99px
- 기타 상태 필요 시 동일 패턴으로 확장

### 모달
구조: `modalBackdrop > modal > (modalHeader + form > (modalBody + modalFooter))`
- `modalHeader`: 제목 + X 닫기 버튼, border-bottom
- `modalBody`: padding 24px, flex-direction column, gap 14px, overflow-y auto
- `modalFooter`: bg #f8fafc, border-top, justify-content flex-end, gap 8px
- `fieldGroup`: label + input 세트 (label은 입력 위에)
- X 버튼: background none, font-size 20px, color #94a3b8

### 입력 필드
```css
input, select {
  padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; color: #1e293b; outline: none; background: #fff;
}
input:focus, select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
}
```

---

## 작업 대상 파일 목록

아래 파일들을 위 패턴에 맞게 순서대로 리뉴얼한다.
**각 파일 작업 전에 반드시 `.bak` 백업 파일을 먼저 생성한다.**

### 공통 레이아웃
- [ ] `src/styles/layout/sidebar.module.css`
- [ ] `src/styles/layout/topbar.module.css`
- [ ] `src/styles/layout/common.module.css`
- [ ] `src/styles/components/DateInput.module.css`
- [ ] `src/styles/components/TooltipButton.module.css`
- [ ] `src/styles/components/moduleIndex.module.css`

### 인증
- [ ] `src/styles/auth/auth.module.css`

### 대시보드
- [ ] `src/styles/dashboard/layout.module.css`
- [ ] `src/styles/dashboard/summary.module.css`
- [ ] `src/styles/dashboard/progress.module.css`
- [ ] `src/styles/dashboard/manager.module.css`
- [ ] `src/styles/dashboard/schedule.module.css`
- [ ] `src/styles/dashboard/modal.module.css`

### 프로젝트
- [ ] `src/styles/project/lot/LotProjectList.module.css`
- [ ] `src/styles/project/lot/LotPage.module.css`
- [ ] `src/styles/project/lot/LotSearchPage.module.css`
- [ ] `src/styles/project/lot/ProcessLotTable.module.css`
- [ ] `src/styles/project/lot/RawMaterialLotTable.module.css`
- [ ] `src/styles/project/lot/SearchInput.module.css`
- [ ] `src/styles/project/lot/01-MixingGrid.module.css` ~ `10-RawDataGrid.module.css` (그리드 10개)
- [ ] `src/styles/project/spec/specList.module.css`
- [ ] `src/styles/project/spec/specView.module.css`
- [ ] `src/styles/project/spec/specNew.module.css`
- [ ] `src/styles/project/spec/materialNew.module.css`
- [ ] `src/styles/project/plan/PlanList.module.css`
- [ ] `src/styles/project/plan/PlanRegister.module.css`
- [ ] `src/styles/project/plan/PlanView.module.css`
- [ ] `src/styles/project/status/StatusProjectList.module.css`
- [ ] `src/styles/project/status/ProductionStatusGrid.module.css`
- [ ] `src/styles/project/status/StatusPage.module.css`
- [ ] `src/styles/project/worklog/WorklogProjectList.module.css`
- [ ] `src/styles/project/worklog/WorklogPage.module.css`
- [ ] `src/styles/project/worklog/WorklogList.module.css`
- [ ] `src/styles/project/worklog/common.module.css`
- [ ] `src/styles/project/worklog/MixingInfoModal.module.css`
- [ ] `src/styles/project/worklog/ExcelRenderer.module.css`

### 품질 (IQC / LQC / OQC)
- [ ] `src/styles/quality/iqc/IQCProjectList.module.css`
- [ ] `src/styles/quality/iqc/IQCTable.module.css`
- [ ] `src/styles/quality/iqc/IQCPage.module.css`
- [ ] `src/styles/quality/iqc/SummaryTable.module.css`
- [ ] `src/styles/quality/lqc/LQCProjectList.module.css`
- [ ] `src/styles/quality/lqc/LQCTable.module.css`
- [ ] `src/styles/quality/lqc/LQCPage.module.css`
- [ ] `src/styles/quality/lqc/SpecEditModal.module.css`
- [ ] `src/styles/quality/oqc/OQCProjectList.module.css`
- [ ] `src/styles/quality/oqc/OQCTable.module.css`
- [ ] `src/styles/quality/oqc/OQCPage.module.css`
- [ ] `src/styles/quality/oqc/AppearanceTable.module.css`
- [ ] `src/styles/quality/oqc/DimensionTable.module.css`
- [ ] `src/styles/quality/oqc/SummaryTable.module.css`

### 재고
- [ ] `src/styles/stock/material/materialTable.module.css`
- [ ] `src/styles/stock/material/electrode.module.css`
- [ ] `src/styles/stock/material/assembly.module.css`
- [ ] `src/styles/stock/material/addMaterialModal.module.css`
- [ ] `src/styles/stock/material/deleteMaterialModal.module.css`
- [ ] `src/styles/stock/material/uploadModal.module.css`
- [ ] `src/styles/stock/material/coaModal.module.css`
- [ ] `src/styles/stock/cell/NCRStatus.module.css`
- [ ] `src/styles/stock/cell/ProjectDetail.module.css`
- [ ] `src/styles/stock/cell/RackStorage.module.css`
- [x] `src/styles/stock/cell/InOut.module.css`

### 설비
- [ ] `src/styles/plant/Equipment.module.css`
- [ ] `src/styles/plant/production/PlantProductionPage.module.css`

### 도면
- [ ] `src/styles/draw/CellDrawingProjectList.module.css`
- [ ] `src/styles/draw/CellDrawingPage.module.css`
- [ ] `src/styles/draw/Drawing.module.css`
- [ ] `src/styles/draw/PdfViewer.module.css`

### 기타
- [ ] `src/styles/etc/permission.module.css`
- [ ] `src/styles/etc/condition/ConditionPage.module.css`
- [ ] `src/styles/pages/profile.module.css`

### 자재 (material — 별도 경로)
- [ ] `src/styles/material/material.module.css`
- [ ] `src/styles/material/rawMaterial.module.css`
- [ ] `src/styles/material/production.module.css`

---

## 작업 규칙

1. **읽고 나서 수정** — 각 파일을 Read로 먼저 읽고, 기존 구조를 파악한 뒤 수정
2. **백업 필수** — 작업 전 `cp xxx.module.css xxx.module.css.bak`
3. **기능 변경 금지** — 클래스명은 유지, 스타일 값만 교체
4. **새 패턴 필요 시** — 위 디자인 토큰에서 벗어나지 않는 범위 내에서 확장
5. **한 번에 한 도메인씩** — 공통 레이아웃 → 인증 → 대시보드 → 프로젝트 순서 권장
6. **완료 후 체크** — 작업한 파일은 위 목록에서 `- [x]`로 표시
