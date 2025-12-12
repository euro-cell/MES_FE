import ExcelJS from 'exceljs';

export interface NamedRangeInfo {
  name: string;
  sheetName: string;
  cellAddress: string;
  row: number;
  col: number;
  value: any;
}

export interface MergeRange {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface MergeInfo {
  isMerged: boolean;
  isTopLeft: boolean;
  rowSpan: number;
  colSpan: number;
}

/**
 * ExcelJS Workbook에서 Named Range 추출
 */
export const extractNamedRanges = (workbook: ExcelJS.Workbook): Record<string, NamedRangeInfo> => {
  const ranges: Record<string, NamedRangeInfo> = {};

  try {
    const definedNames = workbook.model.definedNames;
    if (!definedNames) return ranges;

    definedNames.forEach((definedName: any) => {
      const rangeName = definedName.name;
      const rangeRefs = definedName.ranges;

      if (!rangeRefs || rangeRefs.length === 0) return;

      const rangeRef = rangeRefs[0]; // 첫 번째 범위만 사용
      const match = rangeRef.match(/(.+)!(.+)/);
      if (!match) return;

      const [, sheetName, cellRef] = match;
      const cleanCellAddr = cellRef.replace(/\$/g, ''); // $A$1 → A1
      const cleanSheetName = sheetName.replace(/'/g, ''); // 'Sheet1' → Sheet1

      const sheet = workbook.getWorksheet(cleanSheetName);
      if (!sheet) return;

      const cell = sheet.getCell(cleanCellAddr);

      ranges[rangeName] = {
        name: rangeName,
        sheetName: cleanSheetName,
        cellAddress: cleanCellAddr,
        row: Number(cell.row),
        col: Number(cell.col),
        value: cell.value,
      };
    });
  } catch (error) {
    console.error('Named Range 추출 오류:', error);
  }

  return ranges;
};

/**
 * 셀 주소 파싱 (A1 → {row: 1, col: 1})
 */
export const parseCellAddress = (address: string): { row: number; col: number } => {
  const match = address.match(/^([A-Z]+)(\d+)$/i);
  if (!match) {
    throw new Error(`Invalid cell address: ${address}`);
  }

  const [, colLetters, rowStr] = match;
  let col = 0;
  const letters = colLetters.toUpperCase();

  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }

  return {
    row: parseInt(rowStr, 10),
    col,
  };
};

/**
 * 셀 값 포맷팅 (숫자, 날짜, 퍼센트 등)
 */
export const formatCellValue = (value: any, numFmt?: string): string => {
  if (value === null || value === undefined) return '';

  // 수식 결과 처리
  if (typeof value === 'object' && 'result' in value) {
    return formatCellValue(value.result, numFmt);
  }

  // 숫자 처리
  if (typeof value === 'number') {
    if (numFmt?.includes('%')) {
      return (value * 100).toFixed(1) + '%';
    }
    return String(value);
  }

  // 날짜 처리
  if (value instanceof Date) {
    return value.toLocaleDateString('ko-KR');
  }

  // Rich Text 처리
  if (typeof value === 'object' && 'richText' in value && Array.isArray(value.richText)) {
    return value.richText.map((t: any) => t.text).join('');
  }

  // 하이퍼링크 처리
  if (typeof value === 'object' && 'text' in value && 'hyperlink' in value) {
    return value.text;
  }

  // 기타 객체는 빈 문자열
  if (typeof value === 'object') {
    return '';
  }

  return String(value);
};

/**
 * 병합된 셀인지 확인
 */
export const isCellInMerge = (row: number, col: number, merges: MergeRange[]): MergeInfo => {
  for (const merge of merges) {
    if (row >= merge.top && row <= merge.bottom && col >= merge.left && col <= merge.right) {
      return {
        isMerged: true,
        isTopLeft: row === merge.top && col === merge.left,
        rowSpan: merge.bottom - merge.top + 1,
        colSpan: merge.right - merge.left + 1,
      };
    }
  }

  return {
    isMerged: false,
    isTopLeft: false,
    rowSpan: 1,
    colSpan: 1,
  };
};

/**
 * Form 값을 API Payload로 변환
 */
export const mapFormToPayload = (
  formValues: Record<string, any>,
  namedRanges: Record<string, NamedRangeInfo>
): Record<string, any> => {
  const payload: Record<string, any> = {};

  Object.keys(namedRanges).forEach(rangeName => {
    const value = formValues[rangeName];

    // 빈 값은 null로 변환
    if (value === undefined || value === '') {
      payload[rangeName] = null;
    } else {
      payload[rangeName] = value;
    }
  });

  return payload;
};

/**
 * Named Range로 셀 값 가져오기
 */
export const getCellValueByNamedRange = (workbook: ExcelJS.Workbook, rangeName: string): any => {
  const namedRanges = extractNamedRanges(workbook);
  return namedRanges[rangeName]?.value ?? null;
};

/**
 * Named Range로 셀 값 설정하기
 */
export const setCellValueByNamedRange = (workbook: ExcelJS.Workbook, rangeName: string, value: any): void => {
  const namedRanges = extractNamedRanges(workbook);
  const rangeInfo = namedRanges[rangeName];

  if (!rangeInfo) {
    console.warn(`Named Range not found: ${rangeName}`);
    return;
  }

  const sheet = workbook.getWorksheet(rangeInfo.sheetName);
  if (!sheet) return;

  const cell = sheet.getCell(rangeInfo.cellAddress);
  cell.value = value;
};

/**
 * 모든 Named Range 값을 key-value 쌍으로 가져오기
 */
export const getAllNamedRangeValues = (workbook: ExcelJS.Workbook): Record<string, any> => {
  const namedRanges = extractNamedRanges(workbook);
  const values: Record<string, any> = {};

  Object.keys(namedRanges).forEach(rangeName => {
    values[rangeName] = namedRanges[rangeName].value;
  });

  return values;
};
