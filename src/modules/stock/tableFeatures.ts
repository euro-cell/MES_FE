import { tableFeatures, stockFeatures, createFilteredRowModel, createSortedRowModel } from '@tanstack/react-table';

export const stockTableFeatures = tableFeatures({
  ...stockFeatures,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
});

// 더블클릭: 해당 컬럼의 모든 셀 내용 중 가장 긴 것에 맞춰 너비 자동 조정
export function autoSizeColumn(
  tableEl: HTMLTableElement | null,
  columnId: string,
  setColumnSizing: (updater: (prev: Record<string, number>) => Record<string, number>) => void,
) {
  if (!tableEl) return;
  const cells = tableEl.querySelectorAll<HTMLElement>(`[data-col="${columnId}"]`);
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
}
