import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { Column, RowData } from '@tanstack/react-table';
import { stockTableFeatures } from './tableFeatures';

type ColumnFilterDropdownStyles = { readonly [key: string]: string };

interface ColumnFilterDropdownProps<TData extends RowData> {
  column: Column<typeof stockTableFeatures, TData>;
  allData: TData[];
  label: string;
  styles: ColumnFilterDropdownStyles;
  formatValue?: (columnId: string, raw: unknown) => string;
}

export function ColumnFilterDropdown<TData extends RowData>({
  column,
  allData,
  label,
  styles,
  formatValue,
}: ColumnFilterDropdownProps<TData>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const allValues = useMemo(() => {
    const set = new Set<string>();
    for (const row of allData) {
      const raw = (row as unknown as Record<string, unknown>)[column.id];
      const val = formatValue ? formatValue(column.id, raw) : String(raw ?? '');
      set.add(val);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [allData, column.id, formatValue]);

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
