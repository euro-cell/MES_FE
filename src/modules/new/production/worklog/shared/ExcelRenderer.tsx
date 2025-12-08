import { useMemo } from 'react';
import ExcelJS from 'exceljs';
import { formatCellValue, isCellInMerge, type MergeRange, type NamedRangeInfo } from './excelUtils';
import styles from '../../../../../styles/production/worklog/ExcelRenderer.module.css';

interface CellData {
  value: any;
  numFmt?: string;
  alignment?: any;
}

interface SheetData {
  values: CellData[][];
  merges: MergeRange[];
}

interface ExcelRendererProps {
  workbook: ExcelJS.Workbook;
  sheetName?: string;
  editableRanges?: string[];
  cellValues?: Record<string, any>;
  namedRanges?: Record<string, NamedRangeInfo>;
  onCellChange?: (rangeName: string, value: any) => void;
  className?: string;
  multilineFields?: string[];
}

function decodeAddress(addr: string) {
  const match = addr.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return { row: 0, col: 0 };

  const [, colLetters, rowStr] = match;
  let col = 0;
  const letters = colLetters.toUpperCase();
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return { row: Number(rowStr), col };
}

export default function ExcelRenderer({
  workbook,
  sheetName,
  editableRanges = [],
  cellValues = {},
  namedRanges = {},
  onCellChange,
  className = '',
  multilineFields = [],
}: ExcelRendererProps) {
  const sheetData = useMemo((): SheetData | null => {
    if (!workbook) return null;

    const sheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];

    if (!sheet) return null;

    const maxColCount = Number(sheet.actualColumnCount || sheet.columnCount || 0);
    const maxRowCount = Number(sheet.actualRowCount || sheet.rowCount || 0);

    const values: CellData[][] = [];
    for (let r = 1; r <= maxRowCount; r++) {
      const row = sheet.getRow(r);
      const rowArr: CellData[] = [];

      for (let c = 1; c <= maxColCount; c++) {
        const cell = row.getCell(c);
        rowArr.push({
          value: cell ? cell.value ?? '' : '',
          numFmt: cell?.numFmt,
          alignment: cell?.alignment,
        });
      }

      values.push(rowArr);
    }

    const merges: MergeRange[] = [];
    const mergeRefs: string[] = (sheet.model as any)?.merges || [];

    mergeRefs.forEach(rangeRef => {
      const [start, end] = rangeRef.split(':');
      const s = decodeAddress(start);
      const e = decodeAddress(end);

      merges.push({
        top: s.row - 1,
        left: s.col - 1,
        bottom: e.row - 1,
        right: e.col - 1,
      });
    });

    return { values, merges };
  }, [workbook, sheetName]);

  const getMergeInfo = (rowIdx: number, colIdx: number) => {
    if (!sheetData) {
      return { isMerged: false, isTopLeft: false, rowSpan: 1, colSpan: 1 };
    }

    return isCellInMerge(rowIdx, colIdx, sheetData.merges);
  };

  // Named Range가 해당 셀에 있는지 확인
  const getNamedRangeForCell = (rowIdx: number, colIdx: number): string | null => {
    for (const [rangeName, rangeInfo] of Object.entries(namedRanges)) {
      if (rangeInfo.row === rowIdx + 1 && rangeInfo.col === colIdx + 1) {
        return rangeName;
      }
    }
    return null;
  };

  // 셀이 편집 가능한지 확인
  const isCellEditable = (rowIdx: number, colIdx: number): boolean => {
    const rangeName = getNamedRangeForCell(rowIdx, colIdx);
    return rangeName ? editableRanges.includes(rangeName) : false;
  };

  // 셀 값 가져오기 (cellValues에 있으면 사용, 없으면 원본 사용)
  const getCellValue = (rowIdx: number, colIdx: number, cell: CellData): string => {
    const rangeName = getNamedRangeForCell(rowIdx, colIdx);

    if (rangeName && cellValues[rangeName] !== undefined) {
      return formatCellValue(cellValues[rangeName], cell.numFmt);
    }

    return formatCellValue(cell.value, cell.numFmt);
  };

  const handleInputChange = (rangeName: string, value: string) => {
    if (onCellChange) {
      onCellChange(rangeName, value);
    }
  };

  if (!sheetData) {
    return <p>엑셀 데이터를 불러올 수 없습니다.</p>;
  }

  return (
    <div className={`${styles.excelContainer} ${className}`}>
      <table className={styles.table}>
        <tbody>
          {sheetData.values.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => {
                const mergeInfo = getMergeInfo(rowIdx, colIdx);
                if (mergeInfo.isMerged && !mergeInfo.isTopLeft) return null;

                const isEditable = isCellEditable(rowIdx, colIdx);
                const rangeName = getNamedRangeForCell(rowIdx, colIdx);
                const cellValue = getCellValue(rowIdx, colIdx, cell);
                const textAlign = cell.alignment?.horizontal || 'left';
                const isMultiline = rangeName ? multilineFields.includes(rangeName) : false;

                return (
                  <td
                    key={colIdx}
                    rowSpan={mergeInfo.isMerged ? mergeInfo.rowSpan : 1}
                    colSpan={mergeInfo.isMerged ? mergeInfo.colSpan : 1}
                    className={isEditable ? styles.editableCell : ''}
                    style={{ textAlign }}
                  >
                    {isEditable && rangeName ? (
                      isMultiline ? (
                        <textarea
                          className={styles.cellTextarea}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value)}
                          placeholder={cellValue || '입력...'}
                          rows={3}
                        />
                      ) : (
                        <input
                          type='text'
                          className={styles.cellInput}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value)}
                          placeholder={cellValue || '입력...'}
                        />
                      )
                    ) : (
                      cellValue
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
