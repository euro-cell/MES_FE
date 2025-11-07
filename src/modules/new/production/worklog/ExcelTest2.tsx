import { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import styles from './ExcelTest2.module.css';

interface MergedRange {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export default function ExcelUpload() {
  const [sheetData, setSheetData] = useState<Record<string, { values: any[][]; merges: MergedRange[] }>>({});

  useEffect(() => {
    const loadExcelFromProject = async () => {
      try {
        const response = await fetch('/worklog.xlsx');
        const arrayBuffer = await response.arrayBuffer();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const parsedSheets: Record<string, { values: any[][]; merges: MergedRange[] }> = {};

        workbook.eachSheet(sheet => {
          const rows: any[][] = [];
          const maxColCount = sheet.actualColumnCount || sheet.columnCount || 0;
          const maxRowCount = sheet.actualRowCount || sheet.rowCount || 0;

          for (let r = 1; r <= maxRowCount; r++) {
            const row = sheet.getRow(r);
            const rowValues: any[] = [];
            for (let c = 1; c <= maxColCount; c++) {
              const cell = row.getCell(c);
              rowValues.push(cell.value ?? '');
            }
            rows.push(rowValues);
          }

          const merges: MergedRange[] = [];
          const mergeRefs: string[] = (sheet.model as any)?.merges || [];

          mergeRefs.forEach((rangeRef: string) => {
            const [start, end] = rangeRef.split(':');
            const startCell = sheet.getCell(start);
            const endCell = sheet.getCell(end);

            merges.push({
              top: Number(startCell.row) - 1,
              left: Number(startCell.col) - 1,
              bottom: Number(endCell.row) - 1,
              right: Number(endCell.col) - 1,
            });
          });

          parsedSheets[sheet.name] = { values: rows, merges };
        });

        setSheetData(parsedSheets);
      } catch (error) {
        console.error('❌ 엑셀 로드 오류:', error);
        alert('엑셀 파일을 불러오는 중 오류가 발생했습니다.');
      }
    };

    loadExcelFromProject();
  }, []);

  const getMergeInfo = (sheetName: string, rowIdx: number, colIdx: number) => {
    const merges = sheetData[sheetName]?.merges || [];
    for (const merge of merges) {
      if (rowIdx >= merge.top && rowIdx <= merge.bottom && colIdx >= merge.left && colIdx <= merge.right) {
        const isTopLeft = rowIdx === merge.top && colIdx === merge.left;
        return {
          isMerged: true,
          isTopLeft,
          rowSpan: merge.bottom - merge.top + 1,
          colSpan: merge.right - merge.left + 1,
        };
      }
    }
    return { isMerged: false };
  };

  return (
    <section className={styles.excelUpload}>
      {Object.keys(sheetData).length > 0 ? (
        <div className={styles.previewArea}>
          {Object.entries(sheetData).map(([sheetName, { values }]) => (
            <div key={sheetName} className={styles.sheetBlock}>
              <h3>📄 {sheetName}</h3>
              <table className={styles.table}>
                <tbody>
                  {values.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => {
                        const mergeInfo = getMergeInfo(sheetName, rowIdx, colIdx);
                        if (mergeInfo.isMerged && !mergeInfo.isTopLeft) return null;
                        return (
                          <td
                            key={colIdx}
                            rowSpan={mergeInfo.isMerged ? mergeInfo.rowSpan : 1}
                            colSpan={mergeInfo.isMerged ? mergeInfo.colSpan : 1}
                            className={mergeInfo.isMerged && mergeInfo.colSpan === 12 ? styles.leftMerge : ''}
                          >
                            {cell ?? ''}
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
      ) : (
        <p>📂 프로젝트의 엑셀 파일을 불러오는 중...</p>
      )}
    </section>
  );
}
