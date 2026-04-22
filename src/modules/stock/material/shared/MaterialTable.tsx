import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type FilterFn,
  type Column,
} from '@tanstack/react-table';
import styles from '../../../../styles/stock/material/materialTable.module.css';

export interface MaterialRow {
  id: number;
  process: string;
  category: string;
  type: string;
  purpose: string;
  name: string;
  spec?: string;
  lotNo?: string;
  company?: string;
  origin: string;
  unit: string;
  price?: number;
  note?: string;
  stock?: number;
}

interface MaterialTableProps {
  data: MaterialRow[];
  onEdit: (material: MaterialRow) => void;
  onDelete: (id: number) => void;
  onCoA: (material: MaterialRow) => void;
}

const multiSelectFilter: FilterFn<MaterialRow> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const cellValue = String(row.getValue(columnId) ?? '');
  return filterValue.includes(cellValue);
};

// ── 컬럼 필터 드롭다운 ────────────────────────────────────────────
interface ColumnFilterDropdownProps {
  column: Column<MaterialRow>;
  allData: MaterialRow[];
  label: string;
}

function ColumnFilterDropdown({ column, allData, label }: ColumnFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const allValues = useMemo(() => {
    const set = new Set<string>();
    for (const row of allData) {
      const raw = (row as unknown as Record<string, unknown>)[column.id];
      const val = String(raw ?? '');
      set.add(val);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [allData, column.id]);

  const currentFilter = (column.getFilterValue() as string[] | undefined) ?? [];
  const isActive = currentFilter.length > 0;

  const openDropdown = useCallback(() => {
    setPending(new Set(currentFilter.length > 0 ? currentFilter : allValues));
    setSearch('');
    setOpen(true);
  }, [currentFilter, allValues]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(
    () => allValues.filter(v => v.toLowerCase().includes(search.toLowerCase())),
    [allValues, search],
  );

  const allChecked = filtered.every(v => pending.has(v));

  const toggle = (val: string) => {
    setPending(prev => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };

  const toggleAll = () => {
    if (allChecked) {
      setPending(prev => {
        const next = new Set(prev);
        filtered.forEach(v => next.delete(v));
        return next;
      });
    } else {
      setPending(prev => {
        const next = new Set(prev);
        filtered.forEach(v => next.add(v));
        return next;
      });
    }
  };

  const apply = () => {
    const selected = Array.from(pending);
    column.setFilterValue(selected.length === allValues.length ? undefined : selected);
    setOpen(false);
  };

  const reset = () => {
    column.setFilterValue(undefined);
    setOpen(false);
  };

  return (
    <div className={styles.dropdownWrapper} ref={ref}>
      <div className={styles.thInner}>
        <span
          style={{
            cursor: column.getCanSort() ? 'pointer' : 'default',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
          onClick={column.getToggleSortingHandler()}
        >
          {label}
          {column.getIsSorted() === 'asc' && <span className={styles.sortIcon}>▲</span>}
          {column.getIsSorted() === 'desc' && <span className={styles.sortIcon}>▼</span>}
        </span>
        <button className={`${styles.filterBtn} ${isActive ? styles.active : ''}`} onClick={openDropdown} title='필터'>
          ▼
        </button>
      </div>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownSearch}>
            <input autoFocus placeholder='검색...' value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.dropdownList}>
            <label className={styles.dropdownItem}>
              <input type='checkbox' checked={allChecked} onChange={toggleAll} />
              (전체 선택)
            </label>
            {filtered.map(val => (
              <label key={val} className={styles.dropdownItem}>
                <input type='checkbox' checked={pending.has(val)} onChange={() => toggle(val)} />
                {val === '' ? '(빈 값)' : val}
              </label>
            ))}
          </div>
          <div className={styles.dropdownFooter}>
            <button className={styles.btnApply} onClick={apply}>
              적용
            </button>
            <button onClick={reset}>초기화</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 메인 테이블 컴포넌트 ──────────────────────────────────────────
export default function MaterialTable({ data, onEdit, onDelete, onCoA }: MaterialTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLTableElement>(null);

  const columns = useMemo<ColumnDef<MaterialRow>[]>(
    () => [
      {
        id: 'no',
        header: 'No.',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
        enableColumnFilter: false,
        size: 40,
        minSize: 30,
      },
      { accessorKey: 'category', header: '자재\n(중분류)', filterFn: multiSelectFilter, size: 110 },
      { accessorKey: 'type', header: '종류\n(소분류)', filterFn: multiSelectFilter, size: 110 },
      { accessorKey: 'purpose', header: '용도', filterFn: multiSelectFilter, size: 70 },
      { accessorKey: 'name', header: '제품명', filterFn: multiSelectFilter, size: 160 },
      {
        accessorKey: 'spec',
        header: '규격',
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ? (
            <span title={v} style={{ display: 'block', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {v}
            </span>
          ) : (
            '-'
          );
        },
        filterFn: multiSelectFilter,
        size: 180,
      },
      {
        accessorKey: 'lotNo',
        header: 'Lot No.',
        cell: ({ getValue }) => getValue<string>() || '-',
        filterFn: multiSelectFilter,
        size: 120,
      },
      {
        accessorKey: 'company',
        header: '제조\n공급처',
        cell: ({ getValue }) => getValue<string>() || '-',
        filterFn: multiSelectFilter,
        size: 110,
      },
      { accessorKey: 'origin', header: '국내/외', filterFn: multiSelectFilter, size: 70 },
      { accessorKey: 'unit', header: '단위', filterFn: multiSelectFilter, size: 60 },
      {
        accessorKey: 'price',
        header: '가격',
        cell: ({ getValue }) => Math.floor(getValue<number>() ?? 0).toLocaleString('ko-KR'),
        filterFn: multiSelectFilter,
        size: 90,
      },
      {
        accessorKey: 'note',
        header: '비고',
        cell: ({ getValue }) => getValue<string>() || '-',
        filterFn: multiSelectFilter,
        size: 100,
      },
      {
        accessorKey: 'stock',
        header: '재고',
        cell: ({ getValue }) => getValue<number>() ?? 0,
        filterFn: multiSelectFilter,
        size: 70,
      },
      {
        id: 'actions',
        header: '관리',
        cell: ({ row }) => (
          <div className={styles.managementCell}>
            <button className={styles.coaButton} onClick={() => onCoA(row.original)}>
              CoA
            </button>
            <button className={styles.editButton} onClick={() => onEdit(row.original)}>
              수정
            </button>
            <button className={styles.deleteButton} onClick={() => onDelete(row.original.id)}>
              삭제
            </button>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
        size: 110,
      },
    ],
    [onEdit, onDelete, onCoA],
  );

  const headerLabelMap: Record<string, string> = {
    no: 'No.',
    category: '자재\n(중분류)',
    type: '종류\n(소분류)',
    purpose: '용도',
    name: '제품명',
    spec: '규격',
    lotNo: 'Lot No.',
    company: '제조\n공급처',
    origin: '국내/외',
    unit: '단위',
    price: '가격',
    note: '비고',
    stock: '재고',
    actions: '관리',
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnSizing },
    onSortingChange: setSorting,
    onColumnFiltersChange: updater => {
      setColumnFilters(
        prev => (typeof updater === 'function' ? updater(prev) : updater) as { id: string; value: string[] }[],
      );
    },
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const autoSizeColumn = useCallback((columnId: string) => {
    if (!tableRef.current) return;
    const cells = tableRef.current.querySelectorAll<HTMLElement>(`[data-col="${columnId}"]`);
    let maxWidth = 0;
    cells.forEach(cell => {
      const prev = cell.style.overflow;
      cell.style.overflow = 'visible';
      maxWidth = Math.max(maxWidth, cell.scrollWidth);
      cell.style.overflow = prev;
    });
    if (maxWidth > 0) {
      setColumnSizing(prev => ({ ...prev, [columnId]: maxWidth + 16 }));
    }
  }, []);

  const rows = table.getRowModel().rows;

  if (data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>데이터가 없습니다.</div>;
  }

  return (
    <table ref={tableRef} className={styles.dataTable} style={{ width: table.getTotalSize() }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  data-col={header.column.id}
                  style={{
                    position: 'relative',
                    width: header.getSize(),
                  }}
                >
                  {header.column.getCanFilter() ? (
                    <ColumnFilterDropdown
                      column={header.column}
                      allData={data}
                      label={headerLabelMap[header.column.id] ?? header.column.id}
                    />
                  ) : (
                    <div className={styles.thInner}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )}
                  <div
                    className={styles.resizeHandle}
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onDoubleClick={() => autoSizeColumn(header.column.id)}
                    title='드래그: 너비 조정 / 더블클릭: 자동 맞춤'
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} data-col={cell.column.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
  );
}
