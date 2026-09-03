# 폼팩터(Form Factor) 확장 계획 - 파우치 → 원통형/각형

## 목적

현재 MES는 파우치형 셀 전용으로 구현되어 있다. 원통형(cylindrical)을 지원 대상에 추가하고,
향후 각형(prismatic)까지 확장 가능한 구조로 만든다.

## 전제

1. 원통형 조립 공정 순서는 아직 확정 전 → 공정 흐름 정의는 스펙 확정 후 채운다.
2. 각형은 당장 구현하지 않으나, 새 폼팩터를 "설정 추가"만으로 얹을 수 있게 레지스트리 구조로 연다.
3. 이 문서는 프론트엔드 변경 계획까지만. 백엔드는 필요 스키마 변경점만 명시.

## 결정 필요 사항 (진행 전 합의)

| # | 항목 | 선택지 |
|---|------|--------|
| D1 | 폼팩터 저장 위치 | (a) 기존 `batteryType` 자유입력을 파싱 (b) **신규 `formFactor` enum 컬럼 추가** (권장) |
| D2 | 폼팩터 확정 시점 | 생산계획 등록 시 / 대시보드 프로젝트 등록 시 (현재 `DashboardEditModal`에 전지타입 입력 있음) |
| D3 | 기존 프로젝트 백필 값 | 전부 `pouch` 로 백필 |
| D4 | 원통 공정에서 전극/화성 공정 재사용 범위 | 전극 6공정 공유 가정 / 화성은 Formation·Grading·Inspection 공유 가정 |
| D5 | IQC/LQC 자재 항목 | 파우치 → Can/Cap Ass'y/Gasket 로 치환하는 방식 확정 필요 |

---

## 1. 폼팩터 추상화 레이어 (공정 흐름과 독립 - 지금 확정 가능)

### 1.1 신규 파일: `src/config/formFactor.ts`

```ts
export type FormFactor = 'pouch' | 'cylindrical' | 'prismatic';

export const FORM_FACTORS: Record<FormFactor, {
  id: FormFactor;
  label: string;          // '파우치' | '원통형' | '각형'
  enabled: boolean;       // prismatic: false (UI 노출 제어)
}> = {
  pouch:       { id: 'pouch',       label: '파우치',  enabled: true },
  cylindrical: { id: 'cylindrical', label: '원통형',  enabled: true },
  prismatic:   { id: 'prismatic',   label: '각형',    enabled: false },
};

export const DEFAULT_FORM_FACTOR: FormFactor = 'pouch';
export const getFormFactorLabel = (ff: FormFactor) => FORM_FACTORS[ff]?.label ?? ff;
export const listEnabledFormFactors = () =>
  Object.values(FORM_FACTORS).filter(f => f.enabled);
```

새 폼팩터 추가 = 이 파일에 항목 1개 + 아래 2·3·4장 config 3곳에 케이스 추가. 그 외 코드 무수정이 목표.

### 1.2 프로젝트 타입에 필드 추가

- `src/modules/project/worklog/WorklogTypes.ts` `WorklogProject`에 `formFactor: FormFactor` 추가
- `src/modules/project/lot/LotTypes.ts` `LotProject`에 동일
- `src/modules/quality/iqc/IQCTypes.ts` `IQCProject`, `src/modules/quality/lqc/LQCTypes.ts` 프로젝트 타입에 동일
- `src/modules/dashboard/types.ts` 프로젝트 타입에 동일

### 1.3 폼팩터 선택 UI

- `src/modules/dashboard/DashboardEditModal.tsx`: 현재 `batteryType` 자유입력 → `formFactor` select 추가
  (`listEnabledFormFactors()` 로 옵션 렌더). `batteryType`은 화학조성(NCM/LFP 등) 용도로 존치하거나 분리.
- `src/modules/project/plan/PlanRegister.tsx`: 프로젝트의 `formFactor`를 읽어 공정표(`processList`)를 분기 (아래 2장)

### 1.4 컨텍스트 전달

- 프로젝트 로더 훅들(`useProjectLoader`, `useWorklogFormInit` 등)이 이미 프로젝트 객체를 불러오므로
  `project.formFactor`를 그대로 하위로 전달. 별도 전역 상태 불필요.
- 필요 시 얇은 헬퍼 훅 `useFormFactor(projectId)` 하나 추가해 중복 제거.

---

## 2. 공정 흐름 분기 (원통 스펙 확정 후 값 채움 / 구조는 지금)

### 2.1 `src/modules/project/worklog/processConfig.ts` 리팩터링

현재:
```ts
export const PROCESS_CONFIG: Record<string, ProcessInfo[]> = { Electrode: [...], Assembly: [...], Formation: [...] };
```

변경:
```ts
type CategoryProcesses = Record<'Electrode' | 'Assembly' | 'Formation', ProcessInfo[]>;

const SHARED_ELECTRODE: ProcessInfo[] = [ /* Binder~Notching, 현행 유지 */ ];
const SHARED_FORMATION: ProcessInfo[] = [ /* Formation, Grading, Inspection */ ];

export const PROCESS_CONFIG_BY_FF: Record<FormFactor, CategoryProcesses> = {
  pouch: {
    Electrode: SHARED_ELECTRODE,
    Assembly: [ VD, Forming, Stacking, Welding, Sealing, Filling ],   // 현행 그대로
    Formation: SHARED_FORMATION,
  },
  cylindrical: {
    Electrode: SHARED_ELECTRODE,
    Assembly: [ /* TODO: 스펙 확정 - 예: Winding, TabWelding, CanInsertion, Beading, Crimping, Filling */ ],
    Formation: SHARED_FORMATION,
  },
  prismatic: { /* 후순위 */ },
};
```

- `PROCESS_CONFIG`, `ALL_PROCESSES`, `getProcessById`, `getProcessesByCategory`,
  `createProcessMenus`, `createCategoryMenus` 전부 `formFactor` 인자를 받도록 시그니처 변경.
- 호출부(메뉴 빌더, submenu 훅) 수정.

### 2.2 `src/modules/project/worklog/shared/processCategories.ts`

`PROCESS_CATEGORY_MAP`을 폼팩터별 맵을 병합해서 조회하는 함수로 전환:
```ts
export const getProcessCategory = (processId: string, ff: FormFactor): ProcessCategory
```

### 2.3 `src/modules/project/plan/PlanRegister.tsx`

하드코딩된 `processList` (라인 100~128, "Pouch Forming" 등 포함)를
`PROCESS_CONFIG_BY_FF[formFactor]` 기반으로 생성하도록 교체.

### 2.4 공정별 폼 / 그리드

디렉터리 구조(`processes/NN-name/`)는 유지하고 원통 전용 공정 폴더 추가:
```
src/modules/project/worklog/processes/
  16-winding/       (원통)
  17-can-insertion/
  18-beading/
  19-crimping/
  ...
```
- 공통 필드(작업자/설비/일자/Lot 연결)는 `shared/`의 기존 훅 재사용.
- `IQCPage`/`WorklogPage` 등에서 `processId` → 컴포넌트 매핑 테이블에 원통 공정 엔트리 추가.

### 2.5 Lot 관리 그리드 (`src/modules/project/lot/manage/components/`)

- 현재 `01~10` 번호 그리드가 파우치 공정에 1:1. `formFactor`에 따라 표시할 그리드 세트를 선택하도록
  매핑 도입 (`GRIDS_BY_FF[formFactor]`).
- 원통 공정용 그리드 컴포넌트 신규 작성 (스펙 확정 후).
- `08-SealingGrid` 등 파우치 전용 그리드는 그대로 유지 (파우치 경로 무손상).

---

## 3. 자재 / BOM 분기

### 3.1 `src/modules/project/spec/material/MaterialInitialRows.ts`

현재 `initialRows` 배열에 `파우치`(id:13) 등 하드코딩.
변경: `getInitialRows(ff: FormFactor): Row[]`
- 전극/공통 자재 행(id 1~12, 14 전해액)은 공유
- Assembly 케이스 자재만 폼팩터별:
  - pouch: `파우치`
  - cylindrical: `Can`, `Cap Assembly`, `Gasket`, (필요시 `Center Pin`)
- `MaterialInitialState.ts`, `MaterialNew` 컴포넌트에서 호출부 수정

### 3.2 `src/modules/project/spec/bom/BomNew.tsx`, `BomEdit.tsx`

`파우치` 문자열 참조 지점을 폼팩터별 케이스 자재 목록 상수로 치환.

### 3.3 자재 LOT 훅

- `src/modules/project/worklog/shared/usePouchLots.ts` → `useCellCaseLots(ff)` 로 일반화
  (`getMaterialLots({ category })` 의 category를 폼팩터별로: '파우치' | '캔')
- 기존 `usePouchLots` 는 신규 훅 래퍼로 남겨 하위호환 유지 가능.
- `SealingRegister.tsx`, `SealingEdit.tsx` 등 소비처는 원통에서는 대응 원통 공정 폼에서 신규 훅 사용.

---

## 4. 품질(IQC / LQC / OQC) 분기

### 4.1 IQC

- `src/modules/quality/iqc/IQCTypes.ts`:
  - `IQCMenuType`에 원통 케이스 자재 추가 (`Can`, `CapAssembly`, `Gasket`)
  - `CATEGORY_MAP`에 해당 한글 카테고리 매핑 추가
- `src/modules/quality/iqc/menuConfig.ts` `createIQCMenus(projectId)` →
  `createIQCMenus(projectId, ff)` 로 변경, 폼팩터에 따라 `파우치` 항목 대신 원통 항목 노출
- `src/modules/quality/iqc/tables/PouchTable.tsx` 는 유지, `CanTable.tsx` 등 신규 작성
- `IQCPage.tsx` 의 menu → 테이블 매핑에 원통 항목 추가

### 4.2 LQC

- `src/modules/quality/lqc/processConfig.ts` 를 2장과 동일하게 폼팩터별로 분기
- `components/assembly/` 의 Sealing 계열 측정 테이블/차트는 파우치 전용 → 원통 조립 공정용
  측정 컴포넌트 신규 (Crimping 높이, Beading 치수 등, 스펙 확정 후)
- coating/press/vd/mixing/formation 컴포넌트는 전극·화성 공유이므로 재사용

### 4.3 OQC

- `src/modules/quality/oqc/processConfig.ts` 동일 패턴으로 분기
- OQC 검사 항목이 셀 형상에 의존하는 부분(치수/외관) 폼팩터별 스펙 필요

---

## 5. 백엔드 필요 변경점 (구현은 이번 범위 밖)

| 영역 | 변경 |
|------|------|
| 프로젝트 테이블 | `form_factor` 컬럼 추가 (enum/varchar), 기존 행 `pouch` 백필 |
| 프로젝트 생성/수정 API | `formFactor` 필드 수용, 응답에 포함 |
| 자재 카테고리 | `캔`, `캡조립체`, `가스켓` 등 카테고리 코드 추가 (자재 마스터) |
| 공정 마스터 | 원통 공정 ID 등록 (Winding 등) |
| 작업일지 / 검사 저장 스키마 | 원통 공정별 필드 테이블 신규 (파우치 Sealing 등과 대칭) |
| IQC/LQC/OQC 검사 항목 마스터 | 원통 케이스 자재 검사 스펙 시드 |

---

## 6. 마이그레이션 / 롤아웃 전략

1. **1단계 (구조, 무동작 변경):** 1장 폼팩터 레이어 + 2·3·4장 config 시그니처 변경.
   모든 폼팩터별 분기에서 `pouch` 케이스는 현행과 100% 동일하게 유지. 회귀 없음 확인.
2. **2단계 (백엔드):** `form_factor` 컬럼 + API + 기존 데이터 `pouch` 백필.
3. **3단계 (원통 공정 스펙 확정):** D1~D5 및 원통 조립 공정 순서 확정.
4. **4단계 (원통 구현):** 2.4/2.5 폼/그리드, 3.1 자재, 4.x 검사 컴포넌트를 원통 케이스로 채움.
5. **5단계:** 원통 프로젝트 1건으로 E2E 검증.

가드 패턴: 화면단은 `if (ff === 'cylindrical') { ... } else { /* 기존 파우치 경로 */ }` 로 점진 도입.
config 레지스트리에 없는 폼팩터는 `DEFAULT_FORM_FACTOR`(pouch)로 폴백.

---

## 7. 영향 파일 요약

### 신규
- `src/config/formFactor.ts`
- `src/modules/project/worklog/processes/16-winding/` 외 원통 공정 폴더
- `src/modules/project/lot/manage/components/` 원통 그리드
- `src/modules/quality/iqc/tables/CanTable.tsx` 외 원통 검사 테이블
- `src/modules/quality/lqc/components/assembly/` 원통 측정 컴포넌트

### 수정 (시그니처 / 분기)
- `src/modules/project/worklog/processConfig.ts`
- `src/modules/project/worklog/shared/processCategories.ts`
- `src/modules/project/worklog/WorklogTypes.ts`
- `src/modules/project/lot/LotTypes.ts`
- `src/modules/project/plan/PlanRegister.tsx`, `PlanTypes.ts`
- `src/modules/project/spec/material/MaterialInitialRows.ts`, `MaterialInitialState.ts`
- `src/modules/project/spec/bom/BomNew.tsx`, `BomEdit.tsx`
- `src/modules/project/worklog/shared/usePouchLots.ts`
- `src/modules/quality/iqc/IQCTypes.ts`, `menuConfig.ts`, `IQCPage.tsx`
- `src/modules/quality/lqc/processConfig.ts`, `LQCTypes.ts`
- `src/modules/quality/oqc/processConfig.ts`
- `src/modules/dashboard/DashboardEditModal.tsx`, `types.ts`
- 메뉴/서브메뉴 빌더 (`menuConfig.ts`, `useActiveSubmenu` 등 `createProcessMenus` 호출부)
