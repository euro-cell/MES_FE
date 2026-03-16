import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
import type { CellInventoryDetail } from '../../../../api/stock/ProjectService';
import styles from '../../../../styles/stock/cell/ProjectDetail.module.css';

interface ProjectTableProps {
  data: CellInventoryDetail[];
}

const multiSelectFilter: FilterFn<CellInventoryDetail> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const cellValue = String(row.getValue(columnId) ?? '');
  return filterValue.includes(cellValue);
};

// ── 컬럼 필터 드롭다운 ────────────────────────────────────────────
interface ColumnFilterDropdownProps {
  column: Column<CellInventoryDetail>;
  allData: CellInventoryDetail[];
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
      let val: string;
      if (column.id === 'isShipped') val = raw ? '출고' : '';
      else if (column.id === 'isRestocked') val = raw ? '재입고' : '';
      else val = String(raw ?? '');
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
export default function ProjectTable({ data }: ProjectTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);


  const hasAllProjectNo = data.every(item => item.projectNo);
  const hasAllModel = data.every(item => item.model);
  const showProjectNoAndModel = hasAllProjectNo && hasAllModel;

  const columns = useMemo<ColumnDef<CellInventoryDetail>[]>(() => {
    const baseCols: ColumnDef<CellInventoryDetail>[] = [
      {
        id: 'no',
        header: 'No.',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
        enableColumnFilter: false,
        size: 50,
        minSize: 40,
      },
      { accessorKey: 'lot', header: 'Lot No.', filterFn: multiSelectFilter, size: 130 },
      { accessorKey: 'projectName', header: '프로젝트명', filterFn: multiSelectFilter, size: 150 },
    ];

    if (showProjectNoAndModel) {
      baseCols.push(
        { accessorKey: 'projectNo', header: 'Project No.', filterFn: multiSelectFilter, size: 130 },
        { accessorKey: 'model', header: '모델', filterFn: multiSelectFilter, size: 100 },
      );
    }

    baseCols.push(
      { accessorKey: 'grade', header: '등급', filterFn: multiSelectFilter, size: 80 },
      {
        accessorKey: 'ncrGrade',
        header: 'NCR 등급',
        cell: ({ getValue }) => getValue<string>() || '-',
        filterFn: multiSelectFilter,
        size: 90,
      },
      { accessorKey: 'date', header: '보관 일자', filterFn: multiSelectFilter, size: 110 },
      { accessorKey: 'storageLocation', header: '보관 위치', filterFn: multiSelectFilter, size: 60 },
      {
        accessorKey: 'shippingDate',
        header: '출고 일자',
        cell: ({ getValue }) => getValue<string>() || '-',
        filterFn: multiSelectFilter,
        size: 110,
      },
      {
        accessorKey: 'shippingStatus',
        header: '출고 현황',
        cell: ({ getValue }) => getValue<string>() || '-',
        filterFn: multiSelectFilter,
        size: 110,
      },
      { accessorKey: 'deliverer', header: '인계자', filterFn: multiSelectFilter, size: 90 },
      { accessorKey: 'receiver', header: '인수자', filterFn: multiSelectFilter, size: 90 },
      {
        accessorKey: 'details',
        header: '상세',
        cell: ({ getValue }) => getValue<string>() || '-',
        filterFn: multiSelectFilter,
        size: 120,
      },
      {
        accessorKey: 'isShipped',
        header: '상태',
        cell: ({ getValue }) => (getValue<boolean>() ? '출고' : ''),
        filterFn: multiSelectFilter,
        size: 70,
      },
      {
        accessorKey: 'isRestocked',
        header: '재입고',
        cell: ({ getValue }) => (getValue<boolean>() ? '재입고' : ''),
        filterFn: multiSelectFilter,
        size: 80,
      },
    );

    return baseCols;
  }, [showProjectNoAndModel]);

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

  // 더블클릭: 해당 컬럼의 모든 셀 내용 중 가장 긴 것에 맞춰 너비 자동 조정
  const autoSizeColumn = useCallback((columnId: string) => {
    if (!tableRef.current) return;
    const cells = tableRef.current.querySelectorAll<HTMLElement>(`[data-col="${columnId}"]`);
    let maxWidth = 0;
    cells.forEach(cell => {
      // 임시로 overflow visible로 실제 scrollWidth 측정
      const prev = cell.style.overflow;
      cell.style.overflow = 'visible';
      maxWidth = Math.max(maxWidth, cell.scrollWidth);
      cell.style.overflow = prev;
    });
    if (maxWidth > 0) {
      setColumnSizing(prev => ({ ...prev, [columnId]: maxWidth + 16 }));
    }
  }, []);

  const headerLabelMap: Record<string, string> = {
    no: 'No.',
    lot: 'Lot No.',
    projectName: '프로젝트명',
    projectNo: 'Project No.',
    model: '모델',
    grade: '등급',
    ncrGrade: 'NCR 등급',
    date: '보관 일자',
    storageLocation: '보관 위치',
    shippingDate: '출고 일자',
    shippingStatus: '출고 현황',
    deliverer: '인계자',
    receiver: '인수자',
    details: '상세',
    isShipped: '상태',
    isRestocked: '재입고',
  };

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 37,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  if (data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>데이터가 없습니다.</div>;
  }

  return (
    <div
      ref={scrollRef}
      className={styles.tableSection}
      style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}
    >
      <table ref={tableRef} className={styles.dataTable} style={{ width: '100%' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  data-col={header.column.id}
                  style={{ position: 'relative', ...(columnSizing[header.column.id] ? { width: columnSizing[header.column.id] } : {}) }}
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
          {paddingTop > 0 && <tr><td style={{ height: paddingTop }} /></tr>}
          {virtualRows.map(virtualRow => {
            const row = rows[virtualRow.index];
            return (
              <tr key={row.id} style={row.original.isShipped ? { backgroundColor: '#fff9e6' } : undefined}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} data-col={cell.column.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && <tr><td style={{ height: paddingBottom }} /></tr>}
        </tbody>
      </table>
    </div>
  );
}
