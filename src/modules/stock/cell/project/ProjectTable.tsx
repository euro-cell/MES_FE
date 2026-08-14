import { useMemo, useState, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  useTable,
  flexRender,
  type ColumnDef,
  type SortingState,
  type FilterFn,
} from '@tanstack/react-table';
import { stockTableFeatures, autoSizeColumn as autoSizeColumnImpl } from '../../tableFeatures';
import { ColumnFilterDropdown } from '../../ColumnFilterDropdown';
import type { CellInventoryDetail } from '../../../../api/stock/ProjectService';
import styles from '../../../../styles/stock/cell/ProjectDetail.module.css';

interface ProjectTableProps {
  data: CellInventoryDetail[];
}

const multiSelectFilter: FilterFn<typeof stockTableFeatures, CellInventoryDetail> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const cellValue = String(row.getValue(columnId) ?? '');
  return filterValue.includes(cellValue);
};

function formatFilterValue(columnId: string, raw: unknown): string {
  if (columnId === 'isShipped') return raw ? '출고' : '';
  if (columnId === 'isRestocked') return raw ? '재입고' : '';
  return String(raw ?? '');
}

// ── 메인 테이블 컴포넌트 ──────────────────────────────────────────
export default function ProjectTable({ data }: ProjectTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showProjectNoAndModel = useMemo(
    () => data.every(item => item.projectNo) && data.every(item => item.model),
    [data],
  );

  const columns = useMemo<ColumnDef<typeof stockTableFeatures, CellInventoryDetail>[]>(() => {
    const baseCols: ColumnDef<typeof stockTableFeatures, CellInventoryDetail>[] = [
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

  const table = useTable({
    features: stockTableFeatures,
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
  });

  const autoSizeColumn = useCallback(
    (columnId: string) => autoSizeColumnImpl(tableRef.current, columnId, setColumnSizing),
    [],
  );

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
                      styles={styles}
                      formatValue={formatFilterValue}
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
