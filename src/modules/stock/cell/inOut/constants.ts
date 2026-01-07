// 한글을 영어로 변환하는 매핑 (QWERTY 자판)
export const KOREAN_TO_ENGLISH: { [key: string]: string } = {
  ㅂ: 'q',
  ㅈ: 'w',
  ㄷ: 'e',
  ㄱ: 'r',
  ㅅ: 't',
  ㅛ: 'y',
  ㅕ: 'u',
  ㅑ: 'i',
  ㅐ: 'o',
  ㅔ: 'p',
  ㅁ: 'a',
  ㄴ: 's',
  ㅇ: 'd',
  ㄹ: 'f',
  ㅎ: 'g',
  ㅗ: 'h',
  ㅓ: 'j',
  ㅏ: 'k',
  ㅣ: 'l',
  ㅋ: 'z',
  ㅌ: 'x',
  ㅊ: 'c',
  ㅍ: 'v',
  ㅠ: 'b',
  ㅜ: 'n',
  ㅡ: 'm',
};

export const NCR_GRADES = [
  'F-NCR1',
  'F-NCR2',
  'F-NCR3',
  'F-NCR4',
  'F-NCR5',
  'F-NCR6',
  'F-NCR7',
  'F-NCR8',
  'NCR1',
  'NCR2',
  'NCR3',
  'NCR4',
  'NCR5',
  'NCR6',
  'NCR7',
  'NCR8',
  'NCR9',
  'NCR10',
  'NCR11',
  '기타-1',
  '기타-2',
];

export const STORAGE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const STORAGE_NUMBERS = [1, 2, 3, 4, 5];

// 보관 위치별 최대 용량
export const STORAGE_CAPACITY: { [key: string]: number } = {
  'A': 96, 'B': 96, 'C': 96, 'D': 96, 'E': 96, 'F': 96,
  'G': 64, 'H': 64, 'I': 64, 'J': 64,
};
