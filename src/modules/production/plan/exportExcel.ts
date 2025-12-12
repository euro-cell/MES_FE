import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * HTML 테이블을 엑셀 파일로 내보내기
 * @param html - HTML 문자열 (테이블 포함)
 * @param fileName - 저장할 파일 이름
 */
export const exportHtmlTableToExcel = (html: string, fileName: string) => {
  // DOMParser로 HTML 파싱
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return alert('테이블을 찾을 수 없습니다.');

  // 테이블을 시트로 변환
  const ws = XLSX.utils.table_to_sheet(table);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');

  // 엑셀 파일 생성 및 다운로드
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${fileName}.xlsx`);
};
