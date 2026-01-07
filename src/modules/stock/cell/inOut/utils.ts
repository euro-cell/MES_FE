import hangul from 'hangul-js';
import type { InOutFormData, GroupedTableData, ProjectStatistics } from './types';
import { KOREAN_TO_ENGLISH } from './constants';

export const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const convertKoreanToEnglish = (str: string): string => {
  let result = '';
  const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

  for (let char of str) {
    if (koreanRegex.test(char)) {
      if (hangul.isHangul(char)) {
        const decomposed = hangul.disassemble(char);
        result += decomposed.map((d: string) => KOREAN_TO_ENGLISH[d] || d).join('');
      } else {
        result += KOREAN_TO_ENGLISH[char] || char;
      }
    } else {
      result += char;
    }
  }
  return result;
};

export const hasKorean = (str: string): boolean => {
  return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(str);
};

export const buildCellInventoryPayload = (
  formData: InOutFormData,
  convertedLot: string
): any => {
  const payload: any = {
    lot: convertedLot,
    date: formData.cellLotDate,
    receiver: formData.inPerson,
    deliverer: formData.outPerson,
    projectName: formData.projectName,
    grade: formData.grade,
    isRestocked: formData.cellLotType === 'restock',
  };

  // 빈 값이 아닌 필드만 포함
  if (formData.model) payload.model = formData.model;
  if (formData.ncrGrade) payload.ncrGrade = formData.ncrGrade;
  if (formData.projectNo) payload.projectNo = formData.projectNo;
  if (formData.details) payload.details = formData.details;

  // 출고일 때만 shippingStatus 포함
  if (formData.cellLotType === 'out' && formData.shippingStatus) {
    payload.shippingStatus = formData.shippingStatus;
  }

  // 출고가 아닐 때만 storageLocation 포함
  if (formData.cellLotType !== 'out' && formData.storageLocation) {
    payload.storageLocation = formData.storageLocation;
  }

  return payload;
};

export const transformStatisticsToTableData = (statistics: ProjectStatistics[]): GroupedTableData[] => {
  return statistics.map(project => ({
    projectName: project.projectName,
    rows: project.grades.map(grade => ({
      projectName: project.projectName,
      grade: grade.grade,
      totalQty: project.totalAvailable,
      holdingQty: grade.available ?? null,
      inboundQty: grade.inStock ?? null,
      outboundQty: grade.shipped ?? null,
      other: '',
    })),
  }));
};
