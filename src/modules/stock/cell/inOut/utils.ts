import hangul from 'hangul-js';
import type { InOutFormData, CellInventoryRequest } from './types';
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
): CellInventoryRequest => {
  return {
    lot: convertedLot,
    date: formData.cellLotDate,
    receiver: formData.inPerson,
    deliverer: formData.outPerson,
    projectName: formData.projectName,
    model: formData.model,
    grade: formData.grade,
    ncrGrade: formData.ncrGrade,
    storageLocation: formData.storageLocation,
    projectNo: formData.projectNo,
    details: formData.details,
    isRestocked: formData.cellLotType === 'restock',
  };
};
