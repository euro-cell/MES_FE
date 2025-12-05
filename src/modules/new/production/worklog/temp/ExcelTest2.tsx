import { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import styles from './ExcelTest2.module.css';

interface MergedRange {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface SheetInfo {
  values: any[][];
  merges: MergedRange[];
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

function toDisplayValue(value: any, numFmt?: string) {
  if (value === null || value === undefined) return '';

  if (typeof value === 'object' && 'result' in value) {
    return toDisplayValue(value.result, numFmt);
  }

  if (typeof value === 'number') {
    if (numFmt?.includes('%')) {
      return (value * 100).toFixed(1) + '%';
    }
    return value;
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((t: any) => t.text).join('');
    }
    if ('text' in value && 'hyperlink' in value) {
      return value.text;
    }
    return '';
  }
  return value;
}

export default function ExcelTest2() {
  const [sheetData, setSheetData] = useState<Record<string, SheetInfo>>({});

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const resp = await fetch('/worklog_weding.xlsx');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const arrayBuffer = await resp.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const parsed: Record<string, SheetInfo> = {};

        workbook.eachSheet((sheet: any) => {
          const maxColCount = Number(sheet.actualColumnCount || sheet.columnCount || 0);
          const maxRowCount = Number(sheet.actualRowCount || sheet.rowCount || 0);

          const values: any[][] = [];
          for (let r = 1; r <= maxRowCount; r++) {
            const row = sheet.getRow(r);
            const rowArr: any[] = [];

            for (let c = 1; c <= maxColCount; c++) {
              const cell = row.getCell(c);
              rowArr.push({
                value: cell ? cell.value ?? '' : '',
                numFmt: cell?.numFmt,
              });
            }

            values.push(rowArr);
          }

          const merges: MergedRange[] = [];
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

          parsed[sheet.name] = { values, merges };
        });

        setSheetData(parsed);
      } catch (error) {
        console.error('❌ 엑셀 로드 오류:', error);
        alert('엑셀 파일을 불러오는 중 오류가 발생했습니다.');
      }
    };

    loadExcel();
  }, []);

  const getMergeInfo = (sheetName: string, rowIdx: number, colIdx: number) => {
    const merges = sheetData[sheetName]?.merges || [];

    for (const m of merges) {
      if (rowIdx >= m.top && rowIdx <= m.bottom && colIdx >= m.left && colIdx <= m.right) {
        return {
          isMerged: true,
          isTopLeft: rowIdx === m.top && colIdx === m.left,
          rowSpan: m.bottom - m.top + 1,
          colSpan: m.right - m.left + 1,
        };
      }
    }
    return { isMerged: false };
  };

  return (
    <section className={styles.excelUpload}>
      {Object.keys(sheetData).length === 0 ? (
        <p>📂 엑셀 파일 불러오는 중...</p>
      ) : (
        <div className={styles.previewArea}>
          {Object.entries(sheetData).map(([sheetName, sheet]) => (
            <div key={sheetName} className={styles.sheetBlock}>
              <h3>📄 {sheetName}</h3>

              <table className={styles.table}>
                <tbody>
                  {sheet.values.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => {
                        const mergeInfo = getMergeInfo(sheetName, rowIdx, colIdx);
                        if (mergeInfo.isMerged && !mergeInfo.isTopLeft) return null;

                        return (
                          <td
                            key={colIdx}
                            rowSpan={mergeInfo.isMerged ? mergeInfo.rowSpan : 1}
                            colSpan={mergeInfo.isMerged ? mergeInfo.colSpan : 1}
                          >
                            {toDisplayValue(cell.value, cell.numFmt)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
