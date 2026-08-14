import { tableFeatures, stockFeatures, createFilteredRowModel, createSortedRowModel } from '@tanstack/react-table';

export const stockTableFeatures = tableFeatures({
  ...stockFeatures,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
});
