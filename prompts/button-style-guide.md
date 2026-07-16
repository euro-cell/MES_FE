# MES_FE 버튼 수정 가이드

> **규칙 요약**
> - 헤더 / 모달 푸터 버튼 → **Solid** (배경색 있음)
> - 테이블 행 내부 버튼 → **Outlined** (연한 배경 + 보더)

---

## 공통 토큰 (참고용)

| 역할 | 헤더 (Solid) | 행 내부 (Outlined) |
|---|---|---|
| Primary (등록·저장·추가) | `bg:#1d4ed8` `color:white` | `bg:#eff6ff` `color:#1d4ed8` `border:#bfdbfe` |
| Secondary (뒤로·취소·내정보) | `bg:#475569` `color:white` | `bg:#f1f5f9` `color:#475569` `border:#e2e8f0` |
| Edit (수정·편집) | `bg:#f59e0b` `color:white` | `bg:#fef3c7` `color:#b45309` `border:#fde68a` |
| Danger (삭제·로그아웃) | `bg:#e11d48` `color:white` | `bg:#fff1f2` `color:#e11d48` `border:#fecdd3` |
| View (조회) | `bg:#16a34a` `color:white` | `bg:#f0fdf4` `color:#16a34a` `border:#bbf7d0` |
| Download (다운로드·엑셀) | `bg:#6366f1` `color:white` | `bg:#ede9fe` `color:#6366f1` `border:#ddd6fe` |
| Upload/Info (업로드·COA) | `bg:#0891b2` `color:white` | `bg:#ecfeff` `color:#0891b2` `border:#a5f3fc` |

> `border-radius`: 헤더 `8px` / 행 내부 `5px`  
> `hover` (Solid 배경을 한 단계 진하게 / Outlined 배경을 살짝 채우기):
> - Primary `#1e40af` (outlined hover `#dbeafe`)
> - Secondary `#334155` (outlined hover `#e2e8f0`)
> - Edit `#d97706` (outlined hover `#fde68a`)
> - Danger `#be123c` (outlined hover `#ffe4e6`)
> - View `#15803d` (outlined hover `#dcfce7`)
> - Download `#4f46e5` (outlined hover `#ddd6fe`)
> - Upload/Info `#0e7490` (outlined hover `#cffafe`)

---

## 파일별 수정 목록

---

### `src/styles/layout/topbar.module.css`

**.profileBtn** (내 정보)
```css
/* 현재 */
background: #1b263b;
border-radius: 4px;

/* 변경 */
background: #475569;
border: none;
border-radius: 6px;
font-weight: 600;
```

**.logoutBtn** (로그아웃)
```css
/* 현재 */
background: #e74c3c;
border-radius: 4px;

/* 변경 */
background: #e11d48;
border: none;
border-radius: 6px;
font-weight: 600;
```

---

### `src/styles/stock/material/materialTable.module.css`

**.coaButton** (행 내부 → Outlined Info)
```css
/* 현재 */
background-color: #6366f1;
color: white;
border: none;
border-radius: 5px;

/* 변경 */
background-color: #ecfeff;
color: #0891b2;
border: 1px solid #a5f3fc;
border-radius: 5px;
```

**.editButton** (행 내부 → Outlined Edit)
```css
/* 현재 */
background-color: #f59e0b;
color: white;
border: none;

/* 변경 */
background-color: #fef3c7;
color: #b45309;
border: 1px solid #fde68a;
```

**.deleteButton** (행 내부 → Outlined Danger)
```css
/* 현재 */
background-color: #ef4444;
color: white;
border: none;

/* 변경 */
background-color: #fff1f2;
color: #e11d48;
border: 1px solid #fecdd3;
```

---

### `src/styles/stock/material/electrode.module.css`

**.addButton** (헤더 → Solid Primary)
```css
/* 현재 */
background-color: #16a34a;
border-radius: 7px;

/* 변경 */
background-color: #1d4ed8;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background-color: #15803d;
/* 변경 */ background-color: #1e40af;
```

**.uploadButton** (헤더 → Solid Info)
```css
/* 현재 */
background-color: #2563eb;

/* 변경 */
background-color: #0891b2;
```
```css
/* hover */
/* 현재 */ background-color: #1d4ed8;
/* 변경 */ background-color: #0e7490;
```

**.deleteSelectedButton** (헤더 → Solid Danger)
```css
/* 현재 */
background-color: #f97316;

/* 변경 */
background-color: #e11d48;
```
```css
/* hover */
/* 현재 */ background-color: #ea6c0a;
/* 변경 */ background-color: #be123c;
```

**.deleteAllButton** (헤더 → Solid Danger)
```css
/* 현재 */
background-color: #ef4444;

/* 변경 */
background-color: #e11d48;
```
```css
/* hover */
/* 현재 */ background-color: #dc2626;
/* 변경 */ background-color: #be123c;
```

**.pageButton** (페이지네이션 → Solid Secondary)
```css
/* 현재 */
background-color: #16a34a;

/* 변경 */
background-color: #475569;
```
```css
/* hover */
/* 현재 */ background-color: #15803d;
/* 변경 */ background-color: #334155;
```

---

### `src/styles/project/worklog/WorklogList.module.css`

**.downloadBtn** (헤더 → Solid Download)
```css
/* 현재 */
background-color: #16a34a;
border-radius: 4px;

/* 변경 */
background-color: #6366f1;
border-radius: 8px;
font-weight: 600;
```

**.modalCancelBtn** (모달 푸터 → Solid Secondary)
```css
/* 현재 */
background: #e2e8f0;
color: #475569;

/* 변경 */
background: #475569;
color: white;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #cbd5e1;
/* 변경 */ background: #334155;
```

**.modalDownloadBtn** (모달 푸터 → Solid Download)
```css
/* 현재 */
background: #16a34a;

/* 변경 */
background: #6366f1;
border-radius: 8px;
font-weight: 600;
```

---

### `src/styles/project/spec/bomNew.module.css`

**.backBtn** (헤더 → Solid Secondary)
```css
/* 현재 */
background: #1a73e8;

/* 변경 */
background: #475569;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #155bc1;
/* 변경 */ background: #334155;
```

**.saveBtn** (헤더 → Solid Primary)
```css
/* 현재 */
background: #1a73e8;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #155bc1;
/* 변경 */ background: #1e40af;
```

**.cancelBtn** (헤더 → Solid Secondary)
```css
/* 현재 */
background: #fff;
color: #555;
border: 1px solid #ccc;

/* 변경 */
background: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.addBtn** (행 액션 + 버튼 → Outlined Primary 원형)
```css
/* 현재 */
background: #22c55e;
color: #fff;
border: none;
border-radius: 4px;

/* 변경 */
background: #eff6ff;
color: #1d4ed8;
border: 1px solid #bfdbfe;
border-radius: 50%;
```
```css
/* hover */
/* 현재 */ background: #15803d;
/* 변경 */ background: #dbeafe;
```

**.deleteBtn** (행 액션 − 버튼 → Outlined Danger 원형)
```css
/* 현재 */
background: #ef4444;
color: white;
border: none;
border-radius: 4px;

/* 변경 */
background: #fff1f2;
color: #e11d48;
border: 1px solid #fecdd3;
border-radius: 50%;
```

---

### `src/styles/project/spec/specNew.module.css`

**.backBtn** (헤더 → Solid Secondary)
```css
/* 현재 */
background: #1a73e8;

/* 변경 */
background: #475569;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #155bc1;
/* 변경 */ background: #334155;
```

**.saveBtn** (헤더 → Solid Primary)
```css
/* 현재 */
background: #1a73e8;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #155bc1;
/* 변경 */ background: #1e40af;
```

**.addBtn** (행 + 버튼 → Outlined Primary 원형)
```css
/* 현재 */
background: #2db86c;
color: #fff;
border: none;
border-radius: 4px;

/* 변경 */
background: #eff6ff;
color: #1d4ed8;
border: 1px solid #bfdbfe;
border-radius: 50%;
```
```css
/* hover */
/* 현재 */ background: #25a35e;
/* 변경 */ background: #dbeafe;
```

**.removeBtn** (행 − 버튼 → Outlined Danger 원형)
```css
/* 현재 */
background: #e74c3c;
color: #fff;
border: none;
border-radius: 4px;

/* 변경 */
background: #fff1f2;
color: #e11d48;
border: 1px solid #fecdd3;
border-radius: 50%;
```

---

### `src/styles/quality/iqc/IQCTable.module.css`

**.saveButton** (헤더 → Solid Primary)
```css
/* 현재 */
background: #16a34a;
border: 1px solid #16a34a;

/* 변경 */
background: #1d4ed8;
border: none;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #15803d; border-color: #15803d;
/* 변경 */ background: #1e40af;
```

**.cancelButton** (헤더 → Solid Secondary)
```css
/* 현재 */
background: #64748b;
border: 1px solid #64748b;

/* 변경 */
background: #475569;
border: none;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #475569;
/* 변경 */ background: #334155;
```

**.deleteButton** (헤더 → Solid Danger)
```css
/* 현재 */
background: #dc2626;
border: 1px solid #dc2626;

/* 변경 */
background: #e11d48;
border: none;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #b91c1c;
/* 변경 */ background: #be123c;
```

---

### `src/styles/project/status/StatusPage.module.css`

**.backButton** (헤더 → Solid Secondary, 이미 #475569 — radius만)
```css
/* 현재 */
background-color: #475569;
border-radius: 6px;

/* 변경 */
background-color: #475569;   /* 동일 */
border-radius: 8px;
font-weight: 600;
```
```css
/* hover */
/* 현재 */ background-color: #334155;  /* 이미 올바름 */
```

**.downloadBtn** (헤더 → Solid Download)
```css
/* 현재 */
background: #16a34a;

/* 변경 */
background: #6366f1;
border-radius: 8px;
font-weight: 600;
```

---

### `src/styles/stock/cell/RackStorage.module.css`

**.refreshBtn** (헤더 → Solid Secondary)
```css
/* 현재 */
background-color: #4caf50;

/* 변경 */
background-color: #475569;
border-radius: 8px;
font-weight: 600;
```
```css
/* hover */
/* 현재 */ background-color: #45a049;
/* 변경 */ background-color: #334155;
```

---

### `src/styles/components/moduleIndex.module.css`

**.downloadBtn** (헤더 → Solid Download)
```css
/* 현재 */
background: #10b981;
border-radius: 6px;

/* 변경 */
background: #6366f1;
border-radius: 8px;
font-weight: 600;
```
```css
/* hover */
/* 현재 */ background: #059669;
/* 변경 */ background: #4f46e5;
```

> ⚠️ `.submenuButton.active` / `.activeCathode` / `.activeAnode` 탭 버튼은 카테고리 의미가 있어 **변경 제외**.

---

### `src/styles/draw/Drawing.module.css`

**.addButton** (헤더 → Solid Primary)
```css
/* 현재 */
background: #3b82f6;
border-radius: 6px;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
font-weight: 600;
```

**.submitButton** (모달 푸터 → Solid Primary)
```css
/* 현재 */
background: #3b82f6;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```

**.cancelButton** (모달 푸터 → Solid Secondary)
```css
/* 현재 */
background: #f1f5f9;
border: 1px solid #e2e8f0;
color: #475569;

/* 변경 */
background: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.backButton** (헤더 → Solid Secondary)
```css
/* 현재 */
background: #3b82f6;

/* 변경 */
background: #475569;
border-radius: 8px;
```

> ⚠️ `.actionButton` / `.deleteButton` (그룹 행 내부) — 이미 outlined 패턴이므로 **변경 불필요**.

---

### `src/styles/plant/Equipment.module.css`

**.registerBtn** (헤더 → Solid Primary)
```css
/* 현재 */
background: #3b82f6;
border-radius: 6px;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #2563eb;
/* 변경 */ background: #1e40af;
```

**.downloadBtn** (헤더 → Solid Download)
```css
/* 현재 */
background: #10b981;
border-radius: 6px;

/* 변경 */
background: #6366f1;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #059669;
/* 변경 */ background: #4f46e5;
```

**.manualBtn** (행 내부 → Outlined Info)
```css
/* 현재 */
background: #6366f1;
color: #fff;
border: none;
border-radius: 4px;

/* 변경 */
background: #ecfeff;
color: #0891b2;
border: 1px solid #a5f3fc;
border-radius: 5px;
```

**.editBtn** (행 내부 → Outlined Edit)
```css
/* 현재 */
background: #f97316;
color: #fff;
border: none;
border-radius: 4px;

/* 변경 */
background: #fef3c7;
color: #b45309;
border: 1px solid #fde68a;
border-radius: 5px;
```

**.deleteBtn** (행 내부 → Outlined Danger)
```css
/* 현재 */
background: #e11d48;   /* 색은 이미 맞음 */
color: #fff;
border: none;
border-radius: 4px;

/* 변경 */
background: #fff1f2;
color: #e11d48;
border: 1px solid #fecdd3;
border-radius: 5px;
```

**.backBtn** (폼 헤더 → Solid Secondary, 이미 #64748b — radius만)
```css
/* 현재 */
background: #64748b;
border-radius: 6px;

/* 변경 */
background: #475569;
border-radius: 8px;
font-weight: 600;
```

**.saveBtn** (폼 → Solid Primary)
```css
/* 현재 */
background: #3b82f6;
border-radius: 6px;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```

**.cancelBtn** (폼 → Solid Secondary)
```css
/* 현재 */
background: #fff;
color: #64748b;
border: 1px solid #e2e8f0;

/* 변경 */
background: #475569;
color: white;
border: none;
border-radius: 8px;
```

**모달 내 .uploadButton** (→ Solid Info)
```css
/* 현재 */
background: #3b82f6;

/* 변경 */
background: #0891b2;
```

**모달 내 .downloadButton** (→ Solid Download)
```css
/* 현재 */
background: #10b981;

/* 변경 */
background: #6366f1;
border-radius: 8px;
```

**모달 내 .deleteButton** (→ Solid Danger)
```css
/* 현재 */
background: #ef4444;

/* 변경 */
background: #e11d48;
```

---

### `src/styles/project/worklog/common.module.css`

**.saveButton / .btnSubmit** (헤더 → Solid Primary)
```css
/* 현재 */
background: #2563eb;
border-radius: 6px;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
font-weight: 600;
```

**.cancelButton / .btnCancel** (헤더 → Solid Secondary)
```css
/* 현재 */
background: #f3f4f6;
color: #374151;
border: 1px solid #9ca3af;

/* 변경 */
background: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.backButton / .btnBack** (헤더 → Solid Secondary)
```css
/* 현재 */
background: #f3f4f6;
color: #374151;
border: 1px solid #9ca3af;

/* 변경 */
background: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.editButton** (헤더 → Solid Edit)
```css
/* 현재 */
background: #f59e0b;
color: white;

/* 변경 */
background: #f59e0b;
color: white;
border-radius: 8px;
font-weight: 600;
```
```css
/* hover */
/* 현재 */ background: #d97706;
/* 변경 */ background: #d97706;  /* 유지 */
```

> ⚠️ `.loadPreviousButton` (이전 데이터 불러오기) — 연초록 outlined 패턴 유지 권장 (기능 구분 목적)

---

### `src/styles/project/spec/specList.module.css`

**.actionButtons button** — 색상 미정의 (inline 또는 JS 클래스로 적용 중)
```css
/* 현재: 색 없음 — border: none 만 있음 */

/* 변경: 역할에 따라 아래 클래스 추가 */
.editBtn  { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; border-radius:5px; }
.deleteBtn { background:#fff1f2; color:#e11d48; border:1px solid #fecdd3; border-radius:5px; }
```

**.viewBtn** (행 내부 → Outlined View)
```css
/* 현재 */
background-color: #2d72d9;
color: white;
border: none;

/* 변경 */
background-color: #f0fdf4;
color: #16a34a;
border: 1px solid #bbf7d0;
border-radius: 6px;
```

**.registerBtn** (행 내부 → Solid Primary)
```css
/* 현재 */
background-color: #2db86c;

/* 변경 */
background-color: #1d4ed8;
border-radius: 8px;
```

**.deleteBtn** (행 내부 → Outlined Danger)
```css
/* 현재 */
background-color: #e74c3c;
color: white;
border: none;

/* 변경 */
background-color: #fff1f2;
color: #e11d48;
border: 1px solid #fecdd3;
```

**.cancelBtn** (모달 → Solid Secondary)
```css
/* 현재 */
background-color: #777;

/* 변경 */
background-color: #475569;
border-radius: 8px;
```

**.authContainer button** (로그인 버튼 → Solid Primary)
```css
/* 현재 */
background: #1b263b;
border-radius: 6px;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```
```css
/* hover */
/* 현재 */ background: #0f1a2c;
/* 변경 */ background: #1e40af;
```

---

### `src/styles/pages/profile.module.css`

**.submitBtn** (비밀번호 변경 → Solid Primary)
```css
/* 현재 */
background: #1b263b;
border-radius: 6px;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```

---

### `src/styles/project/plan/PlanRegister.module.css`

**.backBtn** (헤더 → Solid Secondary, 이미 #475569 — radius만)
```css
/* 현재 */ border-radius: 6px;
/* 변경 */ border-radius: 8px; font-weight: 600;
```

**.saveBtn** (폼 → Solid Primary)
```css
/* 현재 */
background-color: #2563eb;
border-radius: 6px;

/* 변경 */
background-color: #1d4ed8;
border-radius: 8px;
```

---

### `src/styles/project/plan/PlanView.module.css`

**.excelBtn** (헤더 → Solid Download)
```css
/* 현재 */
background-color: #16a34a;
border-radius: 6px;

/* 변경 */
background-color: #6366f1;
border-radius: 8px;
font-weight: 600;
```

**.backBtn** (헤더 → Solid Secondary, 이미 #475569 — radius만)
```css
/* 현재 */ border-radius: 6px;
/* 변경 */ border-radius: 8px; font-weight: 600;
```

---

### `src/styles/stock/material/addMaterialModal.module.css`

**.cancelButton** (모달 푸터 → Solid Secondary)
```css
/* 현재 */
background-color: #f8fafc;
color: #475569;
border: 1px solid #e2e8f0;

/* 변경 */
background-color: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.submitButton** (모달 푸터 → Solid Primary)
```css
/* 현재 */
background-color: #16a34a;

/* 변경 */
background-color: #1d4ed8;
border-radius: 8px;
```

---

### `src/styles/stock/material/coaModal.module.css`

**.uploadButton** (→ Solid Info)
```css
/* 현재 */ background-color: #3b82f6;
/* 변경 */ background-color: #0891b2;
```

**.downloadButton** (→ Solid Download)
```css
/* 현재 */ background-color: #10b981;
/* 변경 */ background-color: #6366f1;
border-radius: 8px;
```

**.deleteButton** (→ Solid Danger)
```css
/* 현재 */ background-color: #ef4444;
/* 변경 */ background-color: #e11d48;
```

---

### `src/styles/stock/material/uploadModal.module.css`

**.importButton** (모달 푸터 → Solid Primary)
```css
/* 현재 */
background: #22c55e;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```

**.cancelButton** (모달 푸터 → Solid Secondary)
```css
/* 현재 */
background: #f1f5f9;
color: #475569;
border: 1px solid #cbd5e1;

/* 변경 */
background: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.clearButton** (파일 초기화 → Outlined Danger small)
```css
/* 현재 */
background: #ef4444;
color: white;
border: none;

/* 변경 */
background: #fff1f2;
color: #e11d48;
border: 1px solid #fecdd3;
```

---

### `src/styles/quality/lqc/SpecEditModal.module.css`

**.cancelButton** (모달 푸터 → Solid Secondary)
```css
/* 현재 */
background: #fff;
color: #64748b;
border: 1px solid #e2e8f0;

/* 변경 */
background: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.saveButton** (모달 푸터 → Solid Primary)
```css
/* 현재 */
background: #3b82f6;

/* 변경 */
background: #1d4ed8;
border-radius: 8px;
```

---

### `src/styles/project/worklog/MixingInfoModal.module.css`

**.cancelButton** (모달 푸터 → Solid Secondary)
```css
/* 현재 */
background-color: #f0f0f0;
color: #333;

/* 변경 */
background-color: #475569;
color: white;
border: none;
border-radius: 8px;
```

**.selectButton** (모달 푸터 → Solid Primary)
```css
/* 현재 */
background-color: #3b82f6;

/* 변경 */
background-color: #1d4ed8;
border-radius: 8px;
```

---

### `src/styles/etc/users.module.css` + `src/modules/etc/user/*.tsx`

**UserList.tsx — 수정 버튼** (`btnSecondary` 사용 중 → Edit 역할 추가 필요)
```css
/* 현재: .btnSecondary 재사용 */
background: #f1f5f9;
color: #475569;

/* 변경: 새 클래스 .btnEdit 추가 후 교체 */
.btnEdit {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  border-radius: 6px;
}
.btnEdit:hover { background: #fde68a; }
```
```jsx
/* UserList.tsx 수정 */
<button className={styles.btnEdit} onClick={() => handleEdit(u)}>수정</button>
```

**UserList.tsx — 비밀번호 변경 버튼** (인라인 `#3b82f6` → 확정 팔레트 밖의 임의값)
```css
/* 현재: btnSecondary + 인라인 style로 파랑 덮어씀 */
style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}

/* 변경: 인라인 스타일 제거, 새 클래스 .btnAccent 추가 (View #16a34a와 구분되는 보조 액션) */
.btnAccent {
  background: #475569;
  color: white;
  border: none;
  border-radius: 6px;
}
.btnAccent:hover { background: #334155; }
```
```jsx
/* UserList.tsx 수정 */
<button className={styles.btnAccent} onClick={() => handlePasswordChange(u)}>비밀번호</button>
```
> 비밀번호 변경은 파일 특성상 별도 강조색보다 Secondary(#475569) 계열로 격하 — 삭제 다음으로 조심스러운 동작이지만 파괴적이지 않으므로.

**PasswordChangeModal.tsx / UserAddForm.tsx / UserForm.tsx — 모달 푸터**
```css
/* 현재: .btnSecondary(취소) + .btnPrimary(저장/변경) — 이미 확정 팔레트와 일치, 변경 불필요 */
```

---

## 변경 제외 목록

| 파일 | 이유 |
|---|---|
| `moduleIndex` 탭 (양극·음극) | 카테고리 색이 의미를 가짐 |
| `rawMaterial` 탭 | 탭 UI는 버튼 시스템과 별개 |
| `NCRStatus` 버튼 | 이미 신규 토큰 적용 완료 |
| `customer` / `permission` 버튼 | 이미 신규 토큰 적용 완료 |
| `MixingGrid` 등 Lot 그리드 헤더색 | 데이터 그룹 구분용, 버튼 아님 |
| `worklog/common` `.loadPreviousButton` | 연초록 outlined — 기능 구분 목적 유지 |
