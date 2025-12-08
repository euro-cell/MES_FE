import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { extractNamedRanges, type NamedRangeInfo } from './excelUtils';

interface UseNamedRangesReturn {
  namedRanges: Record<string, NamedRangeInfo>;
  getValueByName: (rangeName: string) => any;
  setValueByName: (rangeName: string, value: any) => void;
}

export function useNamedRanges(workbook: ExcelJS.Workbook | null): UseNamedRangesReturn {
  const [namedRanges, setNamedRanges] = useState<Record<string, NamedRangeInfo>>({});

  useEffect(() => {
    if (!workbook) {
      setNamedRanges({});
      return;
    }

    const ranges = extractNamedRanges(workbook);
    setNamedRanges(ranges);
  }, [workbook]);

  const getValueByName = (rangeName: string): any => {
    return namedRanges[rangeName]?.value ?? '';
  };

  const setValueByName = (rangeName: string, value: any): void => {
    setNamedRanges(prev => {
      if (!prev[rangeName]) {
        console.warn(`Named Range not found: ${rangeName}`);
        return prev;
      }

      return {
        ...prev,
        [rangeName]: {
          ...prev[rangeName],
          value,
        },
      };
    });
  };

  return {
    namedRanges,
    getValueByName,
    setValueByName,
  };
}
