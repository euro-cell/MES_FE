import { useMemo } from 'react';
import ExcelJS from 'exceljs';
import { formatCellValue, isCellInMerge, type MergeRange, type NamedRangeInfo } from './excelUtils';
import styles from '../../../../../styles/production/worklog/ExcelRenderer.module.css';

interface CellData {
  value: any;
  numFmt?: string;
  alignment?: any;
  border?: any;
  fill?: any;
  font?: any;
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
  timeFields?: string[];
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

// 테마 색상 기본값 (Office 테마)
const THEME_COLORS = [
  '#FFFFFF', // 0: lt1 (Light 1) - 흰색
  '#000000', // 1: dk1 (Dark 1) - 검정
  '#E7E6E6', // 2: lt2 (Light 2) - 연한 회색
  '#44546A', // 3: dk2 (Dark 2) - 진한 파랑회색
  '#4472C4', // 4: accent1 - 파랑
  '#ED7D31', // 5: accent2 - 주황
  '#A5A5A5', // 6: accent3 - 회색
  '#FFC000', // 7: accent4 - 노랑
  '#5B9BD5', // 8: accent5 - 하늘색
  '#70AD47', // 9: accent6 - 초록
];

// Tint 값을 적용하여 색상 조정
function applyTint(rgbHex: string, tint: number): string {
  if (!tint || tint === 0) return rgbHex;

  const r = parseInt(rgbHex.substring(1, 3), 16);
  const g = parseInt(rgbHex.substring(3, 5), 16);
  const b = parseInt(rgbHex.substring(5, 7), 16);

  let newR: number, newG: number, newB: number;

  if (tint < 0) {
    // 어둡게
    newR = r * (1 + tint);
    newG = g * (1 + tint);
    newB = b * (1 + tint);
  } else {
    // 밝게
    newR = r + (255 - r) * tint;
    newG = g + (255 - g) * tint;
    newB = b + (255 - b) * tint;
  }

  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// ExcelJS의 색상을 CSS 색상으로 변환
function convertColor(color: any): string | undefined {
  if (!color) return undefined;

  // ARGB 형식 (예: 'FFFF0000' = 빨간색)
  if (color.argb) {
    const argb = color.argb;
    if (typeof argb === 'string' && argb.length === 8) {
      const r = parseInt(argb.substring(2, 4), 16);
      const g = parseInt(argb.substring(4, 6), 16);
      const b = parseInt(argb.substring(6, 8), 16);
      const a = parseInt(argb.substring(0, 2), 16) / 255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }

  // RGB 형식
  if (color.rgb) {
    return `#${color.rgb}`;
  }

  // Theme 색상
  if (color.theme !== undefined) {
    const themeIndex = color.theme;
    if (themeIndex >= 0 && themeIndex < THEME_COLORS.length) {
      const baseColor = THEME_COLORS[themeIndex];
      const tint = color.tint || 0;
      return applyTint(baseColor, tint);
    }
  }

  return undefined;
}

// 테두리 스타일을 CSS로 변환
function getBorderStyle(border: any): React.CSSProperties {
  const style: React.CSSProperties = {};
  const defaultBorder = '1px solid #000000'; // 기본 테두리

  const convertBorderSide = (side: any): string => {
    if (!side) return defaultBorder; // 테두리 정보가 없으면 기본값 사용
    const borderStyle = side.style || 'thin';
    const color = convertColor(side.color) || '#000000';

    // ExcelJS border style을 CSS로 매핑
    const styleMap: Record<string, string> = {
      thin: 'solid',
      medium: 'solid',
      thick: 'solid',
      dotted: 'dotted',
      dashed: 'dashed',
      double: 'double',
    };

    const cssStyle = styleMap[borderStyle] || 'solid';
    const width = borderStyle === 'medium' ? '2px' : borderStyle === 'thick' ? '3px' : '1px';

    return `${width} ${cssStyle} ${color}`;
  };

  // 테두리가 있으면 해당 테두리 사용, 없으면 기본 테두리 사용
  style.borderTop = border?.top ? convertBorderSide(border.top) : defaultBorder;
  style.borderLeft = border?.left ? convertBorderSide(border.left) : defaultBorder;
  style.borderBottom = border?.bottom ? convertBorderSide(border.bottom) : defaultBorder;
  style.borderRight = border?.right ? convertBorderSide(border.right) : defaultBorder;

  return style;
}

// 배경색 스타일을 CSS로 변환
function getBackgroundColor(fill: any): string | undefined {
  if (!fill) return undefined;

  if (fill.type === 'pattern') {
    // Solid fill
    if (fill.pattern === 'solid' && fill.fgColor) {
      return convertColor(fill.fgColor);
    }
    // Pattern fill (배경색 사용)
    if (fill.bgColor) {
      return convertColor(fill.bgColor);
    }
  }

  return undefined;
}

// 폰트 스타일을 CSS로 변환
function getFontStyle(font: any): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (!font) return style;

  if (font.bold) style.fontWeight = 'bold';
  if (font.italic) style.fontStyle = 'italic';
  if (font.size) style.fontSize = `${font.size}pt`;
  if (font.name) style.fontFamily = font.name;
  if (font.color) style.color = convertColor(font.color);
  if (font.underline) style.textDecoration = 'underline';
  if (font.strike) style.textDecoration = 'line-through';

  return style;
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
  timeFields = [],
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
        // ExcelJS에서 스타일 정보를 명시적으로 가져오기
        const cellStyle = cell?.style || {};
        const border = cellStyle.border || cell?.border;

        rowArr.push({
          value: cell ? cell.value ?? '' : '',
          numFmt: cell?.numFmt,
          alignment: cellStyle.alignment || cell?.alignment,
          border,
          fill: cellStyle.fill || cell?.fill,
          font: cellStyle.font || cell?.font,
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

  // 시간 값을 HH:mm 형식으로 포맷팅
  const formatTimeValue = (value: any): string => {
    if (!value) return '';
    const timeStr = String(value);

    // 이미 HH:mm 형식이면 그대로 반환
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }

    // HH:mm:ss 형식이면 초 제거
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr.substring(0, 5);
    }

    return timeStr;
  };

  // 셀 값 가져오기 (cellValues에 있으면 사용, 없으면 원본 사용)
  const getCellValue = (rowIdx: number, colIdx: number, cell: CellData): string => {
    const rangeName = getNamedRangeForCell(rowIdx, colIdx);

    if (rangeName && cellValues[rangeName] !== undefined) {
      // 시간 필드인 경우 HH:mm 형식으로 포맷팅
      if (timeFields.includes(rangeName)) {
        return formatTimeValue(cellValues[rangeName]);
      }
      return formatCellValue(cellValues[rangeName], cell.numFmt);
    }

    // 시간 필드인 경우 원본 값도 포맷팅
    if (rangeName && timeFields.includes(rangeName)) {
      return formatTimeValue(cell.value);
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

                // 셀 스타일 생성
                const borderStyle = getBorderStyle(cell.border);
                const backgroundColor = getBackgroundColor(cell.fill);
                const fontStyle = getFontStyle(cell.font);

                const cellStyle: React.CSSProperties = {
                  textAlign,
                  ...borderStyle,
                  ...fontStyle,
                };

                if (backgroundColor) {
                  cellStyle.backgroundColor = backgroundColor;
                }

                // border-collapse에서 테두리 중복을 방지하기 위해 오른쪽과 아래 테두리만 사용
                // 맨 왼쪽 열은 왼쪽 테두리, 맨 위 행은 위쪽 테두리 유지
                if (colIdx > 0) {
                  delete cellStyle.borderLeft;
                }
                if (rowIdx > 0) {
                  delete cellStyle.borderTop;
                }

                return (
                  <td
                    key={colIdx}
                    rowSpan={mergeInfo.isMerged ? mergeInfo.rowSpan : 1}
                    colSpan={mergeInfo.isMerged ? mergeInfo.colSpan : 1}
                    className={isEditable ? styles.editableCell : ''}
                    style={cellStyle}
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
                      ) : timeFields.includes(rangeName) ? (
                        <input
                          type='time'
                          className={styles.cellInput}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value)}
                          placeholder={cellValue || '입력...'}
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
                    ) : isMultiline ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{cellValue}</div>
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
