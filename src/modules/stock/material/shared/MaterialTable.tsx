import { useMemo, useState, useRef, useCallback } from 'react';
import {
  useTable,
  flexRender,
  type ColumnDef,
  type SortingState,
  type FilterFn,
} from '@tanstack/react-table';
import { stockTableFeatures, autoSizeColumn as autoSizeColumnImpl } from '../../tableFeatures';
import { ColumnFilterDropdown } from '../../ColumnFilterDropdown';
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
  hasCoa: boolean;
}

interface MaterialTableProps {
  data: MaterialRow[];
  onEdit: (material: MaterialRow) => void;
  onDelete: (id: number) => void;
  onCoA: (material: MaterialRow) => void;
}

const multiSelectFilter: FilterFn<typeof stockTableFeatures, MaterialRow> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const cellValue = String(row.getValue(columnId) ?? '');
  return filterValue.includes(cellValue);
};

// ── 메인 테이블 컴포넌트 ──────────────────────────────────────────
export default function MaterialTable({ data, onEdit, onDelete, onCoA }: MaterialTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLTableElement>(null);

  const columns = useMemo<ColumnDef<typeof stockTableFeatures, MaterialRow>[]>(
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
        cell: ({ getValue }) => {
          const v = getValue<number>() ?? 0;
          return v % 1 === 0 ? Math.trunc(v) : v;
        },
        filterFn: multiSelectFilter,
        size: 70,
      },
      {
        id: 'actions',
        header: '관리',
        cell: ({ row }) => (
          <div className={styles.managementCell}>
            <button
              className={`${styles.coaButton} ${row.original.hasCoa ? '' : styles.unregistered}`}
              onClick={() => onCoA(row.original)}
            >
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

  const rows = table.getRowModel().rows;

  if (data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
    <table ref={tableRef} className={styles.dataTable} style={{ width: table.getTotalSize() }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  data-col={header.column.id}
                  style={{
                    width: header.getSize(),
                  }}
                >
                  {header.column.getCanFilter() ? (
                    <ColumnFilterDropdown
                      column={header.column}
                      allData={data}
                      label={headerLabelMap[header.column.id] ?? header.column.id}
                      styles={styles}
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
    </div>
  );
}
