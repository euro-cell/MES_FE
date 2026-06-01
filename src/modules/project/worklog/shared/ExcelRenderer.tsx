import { useMemo, useRef, useEffect, useCallback, useState, useId } from 'react';
import type ExcelJS from 'exceljs';
import toast from 'react-hot-toast';
import { formatCellValue, isCellInMerge, type MergeRange, type NamedRangeInfo } from './excelUtils';
import styles from '../../../../styles/project/worklog/ExcelRenderer.module.css';

// 자동 크기 조절 textarea 컴포넌트
function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  onKeyDown,
  dataRangeName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  dataRangeName?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(60, textarea.scrollHeight)}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(60, textarea.scrollHeight)}px`;
  };

  return (
    <textarea
      ref={textareaRef}
      className={styles.cellTextarea}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      data-range-name={dataRangeName}
    />
  );
}

// 수식 참조 정보 타입 (커스텀 툴팁용)
interface FormulaRef {
  field: string;
  label: string;
  color: string;
}

interface FormulaInfo {
  formula: string;
  refs: FormulaRef[];
}

// 커스텀 툴팁 컴포넌트 (색상 지원)
function FormulaTooltip({
  formulaInfo,
  position,
}: {
  formulaInfo: FormulaInfo;
  position: { x: number; y: number };
}) {
  // 수식 문자열에서 레이블을 찾아 색상 적용
  const renderFormula = () => {
    const formula = formulaInfo.formula;
    const parts: React.ReactNode[] = [];

    // 레이블과 색상 매핑 생성
    const labelColorMap = new Map<string, string>();
    formulaInfo.refs.forEach(ref => {
      labelColorMap.set(ref.label, ref.color);
    });

    // 모든 레이블을 찾아서 위치와 함께 저장
    const matches: { start: number; end: number; label: string; color: string }[] = [];
    labelColorMap.forEach((color, label) => {
      let searchStart = 0;
      while (true) {
        const idx = formula.indexOf(label, searchStart);
        if (idx === -1) break;
        matches.push({ start: idx, end: idx + label.length, label, color });
        searchStart = idx + label.length;
      }
    });

    // 위치순 정렬
    matches.sort((a, b) => a.start - b.start);

    // 텍스트와 색상 레이블을 순서대로 조합
    let lastIndex = 0;
    matches.forEach((match, idx) => {
      // 레이블 앞의 텍스트
      if (match.start > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{formula.slice(lastIndex, match.start)}</span>);
      }
      // 색상이 적용된 레이블
      parts.push(
        <span key={`label-${idx}`} style={{ color: match.color, fontWeight: 'bold' }}>
          {match.label}
        </span>,
      );
      lastIndex = match.end;
    });

    // 남은 텍스트
    if (lastIndex < formula.length) {
      parts.push(<span key='text-last'>{formula.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : formula;
  };

  return (
    <div
      className={styles.formulaTooltip}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y - 10,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
      }}
    >
      <div className={styles.formulaText}>{renderFormula()}</div>
    </div>
  );
}

// 다중선택 드롭다운 컴포넌트
function MultiSelectDropdown({
  options,
  value,
  onChange,
  dataRangeName,
}: {
  options: string[];
  value: string; // 쉼표로 구분된 선택값
  onChange: (value: string) => void;
  dataRangeName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = useMemo(() => (value ? value.split(',').map(v => v.trim()).filter(Boolean) : []), [value]);

  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter(v => v !== option)
      : [...selected, option];
    onChange(next.join(', '));
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const displayText = selected.length === 0 ? '선택...' : selected.join(', ');

  return (
    <div ref={containerRef} className={styles.multiSelectContainer} data-range-name={dataRangeName} id={id}>
      <button
        type='button'
        className={styles.multiSelectTrigger}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={selected.length === 0 ? styles.multiSelectPlaceholder : ''}>{displayText}</span>
        <span className={styles.multiSelectArrow}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className={styles.multiSelectDropdown}>
          {options.map(option => (
            <label key={option} className={styles.multiSelectOption}>
              <input
                type='checkbox'
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

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
  dateFields?: string[];
  numericFields?: string[];
  integerFields?: string[];
  readOnlyFields?: string[];
  selectFields?: Record<string, string[]>;
  multiSelectFields?: Record<string, string[]>; // 다중선택 드롭다운 필드
  comboFields?: Record<string, string[]>; // 선택 + 직접입력 가능한 콤보박스 필드
  placeholders?: Record<string, string>;
  uppercaseFields?: string[]; // 대문자+숫자만 허용하는 필드
  tooltips?: Record<string, string>; // 셀 툴팁 (자동계산 수식 등) - 단순 텍스트
  formulaRefs?: Record<string, FormulaInfo>; // 수식 참조 정보 (하이라이트용)
  headerButton?: React.ReactNode; // 첫 번째 행(타이틀) 옆에 표시할 버튼
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
  dateFields = [],
  numericFields = [],
  integerFields = [],
  readOnlyFields = [],
  selectFields = {},
  multiSelectFields = {},
  comboFields = {},
  placeholders = {},
  uppercaseFields = [],
  tooltips = {},
  formulaRefs = {},
  headerButton,
}: ExcelRendererProps) {
  // 호버된 수식 셀의 참조 필드들
  const [highlightedFields, setHighlightedFields] = useState<FormulaRef[]>([]);
  // 커스텀 툴팁 상태
  const [tooltipInfo, setTooltipInfo] = useState<{
    formulaInfo: FormulaInfo;
    position: { x: number; y: number };
  } | null>(null);

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

    // HH:mm~HH:mm 범위 형식이면 그대로 반환
    if (/^\d{2}:\d{2}~\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }

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

  // HH:mm~HH:mm 문자열에서 시작/종료 시간 분리
  const parseTimeRange = (value: string): { start: string; end: string } => {
    if (!value) return { start: '', end: '' };
    const parts = value.split('~');
    return {
      start: parts[0]?.trim() ?? '',
      end: parts[1]?.trim() ?? '',
    };
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

  const handleInputChange = (rangeName: string, value: string | number) => {
    if (onCellChange) {
      onCellChange(rangeName, value);
    }
  };

  // 편집 가능한 셀 목록 (순서대로)
  const editableCellOrder = useMemo(() => {
    if (!sheetData) return [];
    const cells: { rowIdx: number; colIdx: number; rangeName: string }[] = [];

    sheetData.values.forEach((row, rowIdx) => {
      row.forEach((_, colIdx) => {
        const rangeName = getNamedRangeForCell(rowIdx, colIdx);
        if (rangeName && editableRanges.includes(rangeName) && !readOnlyFields.includes(rangeName)) {
          cells.push({ rowIdx, colIdx, rangeName });
        }
      });
    });

    return cells;
  }, [sheetData, namedRanges, editableRanges, readOnlyFields]);

  // Enter 키로 다음 입력 칸으로 이동
  const handleKeyDown = useCallback((e: React.KeyboardEvent, rangeName: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // 멀티라인 필드는 Enter로 줄바꿈 허용
      if (multilineFields.includes(rangeName)) return;

      e.preventDefault();
      const currentIndex = editableCellOrder.findIndex(cell => cell.rangeName === rangeName);
      if (currentIndex >= 0 && currentIndex < editableCellOrder.length - 1) {
        const nextCell = editableCellOrder[currentIndex + 1];
        const nextInput = document.querySelector(
          `[data-range-name="${nextCell.rangeName}"]`
        ) as HTMLElement;
        nextInput?.focus();
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter: 이전 셀로 이동
      if (multilineFields.includes(rangeName)) return;

      e.preventDefault();
      const currentIndex = editableCellOrder.findIndex(cell => cell.rangeName === rangeName);
      if (currentIndex > 0) {
        const prevCell = editableCellOrder[currentIndex - 1];
        const prevInput = document.querySelector(
          `[data-range-name="${prevCell.rangeName}"]`
        ) as HTMLElement;
        prevInput?.focus();
      }
    }
  }, [editableCellOrder, multilineFields]);

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
                const isReadOnly = rangeName ? readOnlyFields.includes(rangeName) : false;

                // 셀 스타일 생성
                const borderStyle = getBorderStyle(cell.border);
                const backgroundColor = getBackgroundColor(cell.fill);
                const fontStyle = getFontStyle(cell.font);

                const cellStyle: React.CSSProperties = {
                  textAlign,
                  ...borderStyle,
                  ...fontStyle,
                };

                // 읽기 전용 필드는 연한 노란색 배경
                if (isReadOnly) {
                  cellStyle.backgroundColor = '#FFFDE7';
                } else if (isEditable && rangeName && (selectFields[rangeName] || multiSelectFields[rangeName])) {
                  // 선택박스/다중선택 필드는 연두색 배경
                  cellStyle.backgroundColor = '#f0fdf4';
                } else if (backgroundColor && !isEditable) {
                  // 편집 가능한 셀이 아닌 경우에만 배경색 적용
                  cellStyle.backgroundColor = backgroundColor;
                }

                // border-collapse에서 테두리 중복을 방지하기 위해 얇은 테두리만 삭제
                // 굵은 테두리(medium, thick)는 유지
                const isThickBorderStyle = (side: any) => {
                  if (!side) return false;
                  const style = side.style || 'thin';
                  return style === 'medium' || style === 'thick';
                };

                if (colIdx > 0 && !isThickBorderStyle(cell.border?.left)) {
                  delete cellStyle.borderLeft;
                }
                if (rowIdx > 0 && !isThickBorderStyle(cell.border?.top)) {
                  delete cellStyle.borderTop;
                }

                // 셀 클래스 결정: 선택박스/다중선택 > 편집가능 > 없음
                const isSelectField = isEditable && rangeName && (selectFields[rangeName] || multiSelectFields[rangeName]);
                const cellClassName = isSelectField
                  ? styles.selectCell
                  : isEditable
                    ? styles.editableCell
                    : '';

                // 툴팁 가져오기
                const tooltip = rangeName ? tooltips[rangeName] : undefined;
                // 수식 참조 정보
                const formulaInfo = rangeName ? formulaRefs[rangeName] : undefined;
                // 이 셀이 하이라이트 대상인지 확인
                const highlightRef = highlightedFields.find(ref => ref.field === rangeName);
                const highlightBorderStyle = highlightRef
                  ? { boxShadow: `inset 0 0 0 3px ${highlightRef.color}` }
                  : {};

                return (
                  <td
                    key={colIdx}
                    rowSpan={mergeInfo.isMerged ? mergeInfo.rowSpan : 1}
                    colSpan={mergeInfo.isMerged ? mergeInfo.colSpan : 1}
                    className={cellClassName}
                    style={{ ...cellStyle, ...highlightBorderStyle }}
                    title={formulaInfo ? undefined : tooltip}
                    onMouseEnter={e => {
                      if (formulaInfo) {
                        setHighlightedFields(formulaInfo.refs);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipInfo({
                          formulaInfo,
                          position: { x: rect.left + rect.width / 2, y: rect.top },
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (formulaInfo) {
                        setHighlightedFields([]);
                        setTooltipInfo(null);
                      }
                    }}
                  >
                    {isEditable && rangeName && !isReadOnly ? (
                      isMultiline ? (
                        <AutoResizeTextarea
                          value={cellValues[rangeName] ?? ''}
                          onChange={(value) => handleInputChange(rangeName, value)}
                          placeholder='내용을 입력하세요 (Ctrl+Enter: 다음 칸)'
                          onKeyDown={(e) => {
                            // 멀티라인에서는 Ctrl+Enter로 다음 셀 이동
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              const currentIndex = editableCellOrder.findIndex(cell => cell.rangeName === rangeName);
                              if (currentIndex >= 0 && currentIndex < editableCellOrder.length - 1) {
                                const nextCell = editableCellOrder[currentIndex + 1];
                                const nextInput = document.querySelector(
                                  `[data-range-name="${nextCell.rangeName}"]`
                                ) as HTMLElement;
                                nextInput?.focus();
                              }
                            }
                          }}
                          dataRangeName={rangeName}
                        />
                      ) : multiSelectFields[rangeName] ? (
                        <MultiSelectDropdown
                          options={multiSelectFields[rangeName]}
                          value={cellValues[rangeName] ?? ''}
                          onChange={value => handleInputChange(rangeName, value)}
                          dataRangeName={rangeName}
                        />
                      ) : selectFields[rangeName] ? (
                        <select
                          className={styles.cellInput}
                          data-range-name={rangeName}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, rangeName)}
                        >
                          <option value=''>선택...</option>
                          {selectFields[rangeName].map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : comboFields[rangeName] ? (
                        <>
                          <input
                            type='text'
                            className={styles.cellInput}
                            data-range-name={rangeName}
                            list={`combo-${rangeName}`}
                            value={cellValues[rangeName] ?? ''}
                            onChange={e => handleInputChange(rangeName, e.target.value)}
                            onKeyDown={e => handleKeyDown(e, rangeName)}
                            placeholder='선택 또는 직접 입력'
                          />
                          <datalist id={`combo-${rangeName}`}>
                            {comboFields[rangeName].map(option => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </>
                      ) : dateFields.includes(rangeName) ? (
                        <input
                          type='date'
                          className={styles.cellInput}
                          data-range-name={rangeName}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, rangeName)}
                        />
                      ) : timeFields.includes(rangeName) ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type='time'
                            className={styles.cellInput}
                            data-range-name={rangeName}
                            value={parseTimeRange(cellValues[rangeName] ?? '').start}
                            onChange={e => {
                              const { end } = parseTimeRange(cellValues[rangeName] ?? '');
                              handleInputChange(rangeName, e.target.value && end ? `${e.target.value}~${end}` : e.target.value);
                            }}
                            onKeyDown={e => handleKeyDown(e, rangeName)}
                          />
                          <span style={{ color: '#666', fontSize: 13 }}>~</span>
                          <input
                            type='time'
                            className={styles.cellInput}
                            value={parseTimeRange(cellValues[rangeName] ?? '').end}
                            onChange={e => {
                              const { start } = parseTimeRange(cellValues[rangeName] ?? '');
                              handleInputChange(rangeName, start && e.target.value ? `${start}~${e.target.value}` : e.target.value);
                            }}
                          />
                        </span>
                      ) : integerFields.includes(rangeName) ? (
                        <input
                          type='number'
                          className={styles.cellInput}
                          data-range-name={rangeName}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onKeyDown={e => handleKeyDown(e, rangeName)}
                          placeholder={placeholders[rangeName] ?? '숫자 입력'}
                          step='1'
                        />
                      ) : numericFields.includes(rangeName) ? (
                        <input
                          type='number'
                          className={styles.cellInput}
                          data-range-name={rangeName}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value === '' ? '' : Number(e.target.value))}
                          onKeyDown={e => handleKeyDown(e, rangeName)}
                          placeholder={placeholders[rangeName] ?? '숫자 입력'}
                          step='any'
                        />
                      ) : uppercaseFields.includes(rangeName) ? (
                        <input
                          type='text'
                          className={styles.cellInput}
                          data-range-name={rangeName}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => {
                            const inputValue = e.target.value;
                            // 한글 입력 감지
                            if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(inputValue)) {
                              toast.error(
                                <div>
                                  영문 대문자와 숫자만 입력 가능합니다.
                                  <br />
                                  키보드를 영문으로 전환해 주세요.
                                </div>
                              );
                            }
                            // 대문자와 숫자만 허용
                            const filtered = inputValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            handleInputChange(rangeName, filtered);
                          }}
                          onKeyDown={e => handleKeyDown(e, rangeName)}
                          placeholder={placeholders[rangeName] ?? 'LOT 입력 (영문+숫자)'}
                        />
                      ) : (
                        <input
                          type='text'
                          className={styles.cellInput}
                          data-range-name={rangeName}
                          value={cellValues[rangeName] ?? ''}
                          onChange={e => handleInputChange(rangeName, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, rangeName)}
                          placeholder={placeholders[rangeName] ?? '텍스트 입력'}
                        />
                      )
                    ) : isMultiline ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{cellValue}</div>
                    ) : (
                      // 첫 번째 행 첫 번째 셀(타이틀)에 headerButton 표시
                      rowIdx === 0 && colIdx === 0 && headerButton ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                          <span>{cellValue}</span>
                          {headerButton}
                        </div>
                      ) : cellValue
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {tooltipInfo && (
        <FormulaTooltip formulaInfo={tooltipInfo.formulaInfo} position={tooltipInfo.position} />
      )}
    </div>
  );
}
