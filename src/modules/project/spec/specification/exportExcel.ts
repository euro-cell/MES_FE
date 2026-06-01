import type ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { SpecForm, Field } from './SpecTypes';

// 스타일 정의
const BORDER_STYLE: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: 'FF888888' },
};

const ALL_BORDERS: Partial<ExcelJS.Borders> = {
  top: BORDER_STYLE,
  bottom: BORDER_STYLE,
  left: BORDER_STYLE,
  right: BORDER_STYLE,
};

// 헤더 스타일 (#dce6f2)
const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFDCE6F2' },
};

// 그룹 셀 스타일 (#f4f6fa)
const GROUP_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF4F6FA' },
};

// 자재 테이블 헤더 스타일 (#f3f6fa)
const MATERIAL_HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF3F6FA' },
};

// Classification 셀 스타일 (#f9fafb)
const CLASSIFICATION_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF9FAFB' },
};

/**
 * 시트의 열 너비를 내용에 맞게 자동 조정
 */
const autoFitColumns = (sheet: ExcelJS.Worksheet, minWidth = 8, maxWidth = 50) => {
  sheet.columns.forEach(column => {
    let maxLength = minWidth;

    column.eachCell?.({ includeEmpty: false }, cell => {
      const cellValue = cell.value?.toString() || '';
      // 한글은 2배 너비로 계산
      const length = [...cellValue].reduce((acc, char) => {
        return acc + (/[\u3131-\uD79D]/.test(char) ? 2 : 1);
      }, 0);
      maxLength = Math.max(maxLength, length);
    });

    column.width = Math.min(maxLength + 2, maxWidth);
  });
};

interface MaterialItem {
  category: string;
  material: string;
  model: string;
  company: string;
  unit: string;
  requiredAmount: number;
  availableStock: number;
  shortage: number;
}

/**
 * 설계 및 자재 소요량 엑셀 내보내기
 * - 시트1: 전지설계
 * - 시트2: 자재 소요량
 */
export const exportSpecToExcel = async (
  form: SpecForm,
  materials: Record<string, MaterialItem[]>,
  projectName: string
) => {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  // ========== 시트 1: 전지설계 ==========
  const specSheet = workbook.addWorksheet('전지설계');

  // 헤더 행
  const specHeaders = ['Classification', '', '', 'Value', 'Remark'];
  const headerRow = specSheet.addRow(specHeaders);
  specSheet.mergeCells(1, 1, 1, 3); // Classification 병합

  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL;
    cell.font = { bold: true };
    cell.border = ALL_BORDERS;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 데이터 행 추가 헬퍼 함수
  const addSpecRow = (
    groupName: string | null,
    subLabel1: string,
    subLabel2: string | null,
    value: string,
    remark: string,
    isFirstInGroup: boolean
  ) => {
    const row = specSheet.addRow([
      isFirstInGroup ? groupName : '',
      subLabel1,
      subLabel2 || '',
      value || '-',
      remark || '-',
    ]);

    row.eachCell((cell, colNumber) => {
      cell.border = ALL_BORDERS;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };

      if (colNumber === 1 && isFirstInGroup) {
        cell.fill = GROUP_FILL;
        cell.font = { bold: true };
      }
    });

    return specSheet.rowCount;
  };

  // 배열 필드 행 추가 헬퍼
  const addArrayRows = (
    groupName: string | null,
    arr: Field[],
    label: string,
    isFirstInGroup: boolean
  ) => {
    arr.forEach((item, i) => {
      const subLabel = arr.length === 1 ? `${label} (%)` : `${label} ${i + 1} (%)`;
      addSpecRow(
        isFirstInGroup && i === 0 ? groupName : null,
        subLabel,
        null,
        item.value,
        item.remark,
        isFirstInGroup && i === 0
      );
    });
  };

  // Cathode 섹션
  const cathodeRowCount =
    form.cathode.activeMaterial.length + form.cathode.conductor.length + form.cathode.binder.length + 3;
  const cathodeStartRow = specSheet.rowCount + 1;

  addArrayRows('Cathode', form.cathode.activeMaterial, 'Active material', true);
  addArrayRows(null, form.cathode.conductor, 'Conductor', false);
  addArrayRows(null, form.cathode.binder, 'Binder', false);
  addSpecRow(null, 'Loading level (mg/cm²)', null, form.cathode.loadingLevel.value, form.cathode.loadingLevel.remark, false);
  addSpecRow(null, 'Thickness (μm)', null, form.cathode.thickness.value, form.cathode.thickness.remark, false);
  addSpecRow(null, 'Electrode density (g/cc)', null, form.cathode.electrodeDensity.value, form.cathode.electrodeDensity.remark, false);

  // Cathode 그룹 셀 병합
  if (cathodeRowCount > 1) {
    specSheet.mergeCells(cathodeStartRow, 1, cathodeStartRow + cathodeRowCount - 1, 1);
  }

  // Anode 섹션
  const anodeRowCount = form.anode.activeMaterial.length + form.anode.conductor.length + form.anode.binder.length + 3;
  const anodeStartRow = specSheet.rowCount + 1;

  addArrayRows('Anode', form.anode.activeMaterial, 'Active material', true);
  addArrayRows(null, form.anode.conductor, 'Conductor', false);
  addArrayRows(null, form.anode.binder, 'Binder', false);
  addSpecRow(null, 'Loading level (mg/cm²)', null, form.anode.loadingLevel.value, form.anode.loadingLevel.remark, false);
  addSpecRow(null, 'Thickness (μm)', null, form.anode.thickness.value, form.anode.thickness.remark, false);
  addSpecRow(null, 'Electrode density (g/cc)', null, form.anode.electrodeDensity.value, form.anode.electrodeDensity.remark, false);

  // Anode 그룹 셀 병합
  if (anodeRowCount > 1) {
    specSheet.mergeCells(anodeStartRow, 1, anodeStartRow + anodeRowCount - 1, 1);
  }

  // Assembly 섹션
  const assemblyStartRow = specSheet.rowCount + 1;

  addSpecRow('Assembly', 'Stack no. (ea)', null, `${form.assembly.stackNo.value1 || '-'} / ${form.assembly.stackNo.value2 || '-'}`, form.assembly.stackNo.remark, true);
  addSpecRow(null, 'Separator (μm)', null, form.assembly.separator.value, form.assembly.separator.remark, false);
  addSpecRow(null, 'Electrolyte (g)', null, form.assembly.electrolyte.value, form.assembly.electrolyte.remark, false);

  // Assembly 그룹 셀 병합
  specSheet.mergeCells(assemblyStartRow, 1, assemblyStartRow + 2, 1);

  // Cell 섹션
  const cellStartRow = specSheet.rowCount + 1;

  addSpecRow('Cell', 'N/P ratio', null, form.cell.npRatio.value, form.cell.npRatio.remark, true);
  addSpecRow(null, 'Nominal capacity (Ah)', null, form.cell.nominalCapacity.value, form.cell.nominalCapacity.remark, false);
  addSpecRow(null, 'Weight (g)', null, form.cell.weight.value, form.cell.weight.remark, false);
  addSpecRow(null, 'Thickness (mm)', null, form.cell.thickness.value, form.cell.thickness.remark, false);

  // Energy density 행
  const energyRow1 = specSheet.addRow(['', 'Energy density', 'Gravimetric (Wh/kg)', form.cell.energyDensity.gravimetric.value || '-', form.cell.energyDensity.gravimetric.remark || '-']);
  energyRow1.eachCell(cell => {
    cell.border = ALL_BORDERS;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const energyRow2 = specSheet.addRow(['', '', 'Volumetric (Wh/L)', form.cell.energyDensity.volumetric.value || '-', form.cell.energyDensity.volumetric.remark || '-']);
  energyRow2.eachCell(cell => {
    cell.border = ALL_BORDERS;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Energy density 병합
  specSheet.mergeCells(energyRow1.number, 2, energyRow2.number, 2);

  // Cell 그룹 셀 병합
  specSheet.mergeCells(cellStartRow, 1, cellStartRow + 5, 1);

  // 서브라벨 셀 병합 (Classification 열 제외한 나머지)
  for (let i = 2; i <= specSheet.rowCount; i++) {
    const row = specSheet.getRow(i);
    const cell2Value = row.getCell(2).value;
    const cell3Value = row.getCell(3).value;

    // Energy density 행이 아니고, 3번째 셀이 비어있으면 2-3열 병합
    if (cell2Value && !cell3Value && cell2Value !== 'Energy density') {
      specSheet.mergeCells(i, 2, i, 3);
    }
  }

  // 열 너비 자동 조정
  autoFitColumns(specSheet);

  // ========== 시트 2: 자재 소요량 ==========
  const materialSheet = workbook.addWorksheet('자재 소요량');

  // 헤더 행 (가용재고, 상태 제외)
  const materialHeaders = ['Classification', '분류', 'Material', 'Model', 'Company', '단위', '소요량'];
  const materialHeaderRow = materialSheet.addRow(materialHeaders);

  materialHeaderRow.eachCell(cell => {
    cell.fill = MATERIAL_HEADER_FILL;
    cell.font = { bold: true };
    cell.border = ALL_BORDERS;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 자재 데이터가 있는 경우
  if (Object.keys(materials).length > 0) {
    Object.entries(materials).forEach(([classification, list]) => {
      const startRow = materialSheet.rowCount + 1;

      list.forEach((item, idx) => {
        const row = materialSheet.addRow([
          idx === 0 ? classification : '',
          item.category,
          item.material,
          item.model,
          item.company,
          item.unit,
          item.requiredAmount,
        ]);

        row.eachCell((cell, colNumber) => {
          cell.border = ALL_BORDERS;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };

          // Classification 셀 스타일
          if (colNumber === 1 && idx === 0) {
            cell.fill = CLASSIFICATION_FILL;
            cell.font = { bold: true };
          }
        });
      });

      // Classification 셀 병합
      if (list.length > 1) {
        materialSheet.mergeCells(startRow, 1, startRow + list.length - 1, 1);
      }
    });
  } else {
    const emptyRow = materialSheet.addRow(['등록된 자재 정보가 없습니다.']);
    materialSheet.mergeCells(emptyRow.number, 1, emptyRow.number, 7);
    emptyRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    emptyRow.getCell(1).border = ALL_BORDERS;
  }

  // 열 너비 자동 조정
  autoFitColumns(materialSheet);

  // 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${projectName}_설계_자재소요량.xlsx`);
};
