import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 타입 정의
interface Cell {
  month: number;
  week: number;
  text: string;
  active: boolean;
  colSpan: number;
}

interface ProcessData {
  group: string;
  name: string;
  type: string | null;
  key: string;
  hasElectrode: boolean;
  cells: Cell[];
}

interface WeekInfo {
  week: number;
  range: number[];
}

interface MonthHeader {
  month: number;
  weeks: WeekInfo[];
}

interface PlanResponse {
  id: number;
  startDate: string;
  endDate: string;
  production: {
    id: number;
    name: string;
    company: string;
    year: number;
  };
  weekHeaders: MonthHeader[];
  processes: ProcessData[];
}

// 스타일 정의
const BORDER_STYLE: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: 'FFE5E7EB' },
};

const HEADER_BORDER_STYLE: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: 'FFE2E8F0' },
};

const ALL_BORDERS = {
  top: BORDER_STYLE,
  bottom: BORDER_STYLE,
  left: BORDER_STYLE,
  right: BORDER_STYLE,
};

const HEADER_BORDERS = {
  top: HEADER_BORDER_STYLE,
  bottom: HEADER_BORDER_STYLE,
  left: HEADER_BORDER_STYLE,
  right: HEADER_BORDER_STYLE,
};

/**
 * 스타일이 적용된 생산 일정 엑셀 내보내기 (ExcelJS 사용)
 */
export const exportPlanToStyledExcel = async (planData: PlanResponse, fileName: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Schedule');

  // 총 주차 수 계산
  const totalWeeks = planData.weekHeaders.reduce((sum, m) => sum + m.weeks.length, 0);

  // === 헤더 행 1: Process + 월 ===
  const headerRow1: (string | null)[] = ['Process', null, null];
  planData.weekHeaders.forEach(m => {
    headerRow1.push(`${m.month}월`);
    // 나머지 주차 셀은 null (병합될 예정)
    for (let i = 1; i < m.weeks.length; i++) {
      headerRow1.push(null);
    }
  });

  const excelRow1 = worksheet.addRow(headerRow1.map(v => v ?? ''));

  // === 헤더 행 2: (빈 셀) + 주차 ===
  const headerRow2: (string | null)[] = [null, null, null];
  planData.weekHeaders.forEach(m => {
    m.weeks.forEach(w => {
      headerRow2.push(`${w.week}w`);
    });
  });

  const excelRow2 = worksheet.addRow(headerRow2.map(v => v ?? ''));

  // 헤더 병합: Process 셀 (A1:C2)
  worksheet.mergeCells('A1:C2');

  // 헤더 병합: 월별 셀
  let colIndex = 4; // D열부터 시작 (1-indexed)
  planData.weekHeaders.forEach(m => {
    if (m.weeks.length > 1) {
      worksheet.mergeCells(1, colIndex, 1, colIndex + m.weeks.length - 1);
    }
    colIndex += m.weeks.length;
  });

  // 헤더 스타일 적용
  [excelRow1, excelRow2].forEach(row => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' },
      };
      cell.font = { bold: true };
      cell.border = HEADER_BORDERS;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // === 데이터 행 ===
  // 병합 정보 추적
  const groupMerges: Map<string, { startRow: number; count: number }> = new Map();
  const nameMerges: Map<string, { startRow: number; count: number }> = new Map();

  // 먼저 그룹과 이름의 병합 정보 계산
  planData.processes.forEach((row, idx) => {
    const dataRowNum = idx + 3; // 헤더 2행 + 1 (1-indexed)

    // 그룹 병합 계산
    if (!groupMerges.has(row.group)) {
      const count = planData.processes.filter(r => r.group === row.group).length;
      groupMerges.set(row.group, { startRow: dataRowNum, count });
    }

    // 이름 병합 계산 (hasElectrode인 경우만)
    if (row.hasElectrode) {
      const nameKey = `${row.group}-${row.name}`;
      if (!nameMerges.has(nameKey)) {
        const count = planData.processes.filter(r => r.name === row.name && r.group === row.group).length;
        nameMerges.set(nameKey, { startRow: dataRowNum, count });
      }
    }
  });

  // 데이터 행 추가
  planData.processes.forEach((row, idx) => {
    const rowData: string[] = [];
    const prevRow = idx > 0 ? planData.processes[idx - 1] : null;
    const showGroup = !prevRow || prevRow.group !== row.group;
    const showName = row.hasElectrode && (!prevRow || prevRow.name !== row.name || prevRow.group !== row.group);

    // 그룹 열
    rowData.push(showGroup ? row.group : '');

    // 이름/타입 열
    if (row.hasElectrode) {
      rowData.push(showName ? row.name : '');
      rowData.push(row.type || '');
    } else {
      rowData.push(row.name);
      rowData.push('');
    }

    // 셀 데이터
    row.cells.forEach(cell => {
      rowData.push(cell.text);
      // colSpan > 1인 경우 빈 셀 추가 (병합 예정)
      for (let i = 1; i < cell.colSpan; i++) {
        rowData.push('');
      }
    });

    const excelRow = worksheet.addRow(rowData);
    const dataRowNum = idx + 3;

    // 셀 스타일 적용
    let cellColIndex = 4; // D열부터 데이터 셀 시작
    row.cells.forEach(cell => {
      for (let i = 0; i < cell.colSpan; i++) {
        const excelCell = excelRow.getCell(cellColIndex + i);
        excelCell.border = ALL_BORDERS;
        excelCell.alignment = { horizontal: 'center', vertical: 'middle' };

        if (cell.active) {
          // 활성 셀 스타일
          excelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFBFDBFE' },
          };
          excelCell.font = { bold: true, color: { argb: 'FF1E3A8A' } };
        } else {
          // 빈 셀 스타일
          excelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      }

      // 셀 병합 (colSpan > 1)
      if (cell.colSpan > 1) {
        worksheet.mergeCells(dataRowNum, cellColIndex, dataRowNum, cellColIndex + cell.colSpan - 1);
      }

      cellColIndex += cell.colSpan;
    });

    // 그룹/이름/타입 셀 스타일
    [1, 2, 3].forEach(colNum => {
      const cell = excelRow.getCell(colNum);
      cell.border = ALL_BORDERS;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // 그룹 열 병합
  groupMerges.forEach(({ startRow, count }) => {
    if (count > 1) {
      worksheet.mergeCells(startRow, 1, startRow + count - 1, 1);
    }
  });

  // 이름 열 병합 (hasElectrode인 경우)
  nameMerges.forEach(({ startRow, count }) => {
    if (count > 1) {
      worksheet.mergeCells(startRow, 2, startRow + count - 1, 2);
    }
  });

  // hasElectrode가 아닌 경우 이름 셀 2-3열 병합
  planData.processes.forEach((row, idx) => {
    if (!row.hasElectrode) {
      const dataRowNum = idx + 3;
      worksheet.mergeCells(dataRowNum, 2, dataRowNum, 3);
    }
  });

  // 열 너비 설정
  worksheet.getColumn(1).width = 12; // 그룹
  worksheet.getColumn(2).width = 15; // 이름
  worksheet.getColumn(3).width = 10; // 타입
  for (let i = 4; i <= 3 + totalWeeks; i++) {
    worksheet.getColumn(i).width = 8; // 주차 셀
  }

  // 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${fileName}.xlsx`);
};

/**
 * HTML 테이블을 엑셀 파일로 내보내기
 * @param html - HTML 문자열 (테이블 포함)
 * @param fileName - 저장할 파일 이름
 */
export const exportHtmlTableToExcel = async (html: string, fileName: string) => {
  // DOMParser로 HTML 파싱
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return alert('테이블을 찾을 수 없습니다.');

  const rows = Array.from(table.querySelectorAll('tr'));

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Schedule');

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    ws.addRow(cells.map((cell) => cell.textContent?.trim() ?? ''));
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${fileName}.xlsx`);
};
