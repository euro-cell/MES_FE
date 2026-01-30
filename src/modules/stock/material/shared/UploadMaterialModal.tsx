import { useState, useCallback, useRef, useEffect } from 'react';
import ExcelJS from 'exceljs';
import styles from '../../../../styles/stock/material/uploadModal.module.css';

// 셀 값 포맷 함수
const formatCellValue = (value: any): string | number | null => {
  if (value === null || value === undefined) return null;

  // 수식 결과 처리
  if (typeof value === 'object' && 'result' in value) {
    return formatCellValue(value.result);
  }

  // 숫자는 그대로 반환
  if (typeof value === 'number') {
    return value;
  }

  // 날짜 처리
  if (value instanceof Date) {
    return value.toLocaleDateString('ko-KR');
  }

  // Rich Text 처리
  if (typeof value === 'object' && 'richText' in value && Array.isArray(value.richText)) {
    return value.richText.map((t: any) => t.text).join('');
  }

  // 기타 객체는 null
  if (typeof value === 'object') {
    return null;
  }

  const strValue = String(value).trim();
  return strValue || null;
};

// 엑셀 컬럼 헤더를 DB 필드로 매핑 (1행+2행 병합 형식 포함)
const COLUMN_MAPPING: Record<string, string> = {
  // 단일 헤더 형식
  '자재(중분류)': 'category',
  '자재 (중분류)': 'category',
  '종류(소분류)': 'type',
  '종류 (소분류)': 'type',
  '용도': 'purpose',
  '제품명': 'name',
  '규격': 'spec',
  'Lot No.': 'lotNo',
  'LOT No.': 'lotNo',
  'LotNo': 'lotNo',
  '제조/공급처': 'company',
  '제조 공급처': 'company',
  '국내/외': 'origin',
  '국내 외': 'origin',
  '단위': 'unit',
  '가격': 'price',
  '비고': 'note',
  '재고': 'stock',
  // 1행+2행 병합 형식 (예: "자재" + "(중분류)" -> "자재(중분류)")
  '자재': 'category',
  '(중분류)': 'category',
  '중분류': 'category',
  '종류': 'type',
  '(소분류)': 'type',
  '소분류': 'type',
};

export interface MaterialUploadData {
  category: string;
  type: string;
  purpose: string;
  name: string;
  spec?: string;
  lotNo?: string;
  company?: string;
  origin: string;
  unit: string;
  price?: number;
  note?: string;
  stock?: number;
}

interface UploadMaterialModalProps {
  show: boolean;
  onClose: () => void;
  onImport: (data: MaterialUploadData[]) => Promise<{ created: number; updated: number }>;
  processType: '전극' | '조립';
}

interface ParsedData {
  headers: string[];
  rows: MaterialUploadData[];
}

export default function UploadMaterialModal({
  show,
  onClose,
  onImport,
  processType,
}: UploadMaterialModalProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 닫히면 상태 초기화
  useEffect(() => {
    if (!show) {
      setParsedData(null);
      setFileName('');
      setError(null);
      setSuccessMessage(null);
      setIsLoading(false);
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [show]);

  // 파일 처리 로직
  const handleFile = useCallback(async (file: File) => {
    // 파일 확장자 검증
    const validExtensions = ['.xlsx', '.xls'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('워크시트를 찾을 수 없습니다.');
      }

      // 헤더 찾기 (1행 + 2행 병합)
      let headerRowNum = 2; // 데이터는 3행부터 시작 (1,2행이 헤더)
      const row1 = worksheet.getRow(1);
      const row2 = worksheet.getRow(2);
      let headers: string[] = [];

      // 1행과 2행을 합쳐서 헤더 생성
      const row1Values: string[] = [];
      const row2Values: string[] = [];

      row1.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const value = formatCellValue(cell.value);
        row1Values[colNumber - 1] = value ? String(value).replace(/\n/g, ' ').trim() : '';
      });

      row2.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const value = formatCellValue(cell.value);
        row2Values[colNumber - 1] = value ? String(value).replace(/\n/g, ' ').trim() : '';
      });

      // 병합: 1행 값 + 2행 값 (둘 다 있으면 합치고, 하나만 있으면 그것만 사용)
      const maxCol = Math.max(row1Values.length, row2Values.length);
      for (let i = 0; i < maxCol; i++) {
        const v1 = row1Values[i] || '';
        const v2 = row2Values[i] || '';
        if (v1 && v2) {
          // 1행과 2행이 동일하거나 1행이 2행에 포함되면 2행만 사용
          if (v1 === v2 || v2.includes(v1)) {
            headers[i] = v2;
          } else {
            headers[i] = `${v1}${v2}`;
          }
        } else {
          headers[i] = v1 || v2;
        }
      }

      // 만약 1행에만 헤더가 있는 경우 (단일 헤더 행)
      if (!row2Values.some(v => v && (v.includes('자재') || v.includes('제품명') || v.includes('분류')))) {
        if (row1Values.some(v => v && (v.includes('자재') || v.includes('제품명')))) {
          headers = row1Values;
          headerRowNum = 1;
        }
      }

      // 헤더 -> 필드 매핑
      const fieldMap: { colIndex: number; field: string }[] = [];
      headers.forEach((header, idx) => {
        if (!header) return;
        // 매핑 테이블에서 찾기
        const normalizedHeader = header.trim();
        const field = COLUMN_MAPPING[normalizedHeader];
        if (field) {
          fieldMap.push({ colIndex: idx + 1, field });
        }
      });

      // 데이터 파싱 (헤더 다음 행부터)
      const rows: MaterialUploadData[] = [];
      for (let rowNum = headerRowNum + 1; rowNum <= worksheet.rowCount; rowNum++) {
        const row = worksheet.getRow(rowNum);

        // 빈 행 체크 (category 또는 name이 없으면 스킵)
        const rowData: Record<string, any> = {};
        let hasData = false;

        fieldMap.forEach(({ colIndex, field }) => {
          const cell = row.getCell(colIndex);
          const value = formatCellValue(cell.value);
          if (value !== null) {
            hasData = true;
            // 숫자 필드 처리
            if (field === 'price' || field === 'stock') {
              rowData[field] = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
            } else {
              rowData[field] = String(value);
            }
          }
        });

        // category와 lotNo가 있는 행만 추가 (식별자로 사용)
        if (hasData && rowData.category && rowData.lotNo) {
          rows.push({
            category: rowData.category || '',
            type: rowData.type || '',
            purpose: rowData.purpose || '',
            name: rowData.name || '',
            spec: rowData.spec || '',
            lotNo: rowData.lotNo || '',
            company: rowData.company || '',
            origin: rowData.origin || '국내',
            unit: rowData.unit || '',
            price: rowData.price || 0,
            note: rowData.note || '',
            stock: rowData.stock || 0,
          });
        }
      }

      if (rows.length === 0) {
        throw new Error('업로드할 데이터가 없습니다. 엑셀 파일의 형식을 확인해주세요.\n(category와 Lot No. 컬럼은 필수입니다)');
      }

      setParsedData({ headers, rows });
    } catch (err) {
      console.error('엑셀 파싱 오류:', err);
      setError(err instanceof Error ? err.message : '파일 파싱에 실패했습니다.');
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 드래그 핸들러들
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // 초기화
  const handleClear = useCallback(() => {
    setParsedData(null);
    setFileName('');
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 등록
  const handleImport = useCallback(async () => {
    if (!parsedData) return;

    setIsImporting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await onImport(parsedData.rows);
      const message = `등록 완료: 신규 ${result.created}건, 수정 ${result.updated}건`;

      // 확인 창으로 닫기 여부 선택
      const shouldClose = window.confirm(`${message}\n\n창을 닫으시겠습니까?`);
      if (shouldClose) {
        onClose();
      } else {
        setSuccessMessage(message);
        setParsedData(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '등록에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsImporting(false);
    }
  }, [parsedData, onImport, onClose]);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{processType} 자재 엑셀 업로드</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* 업로드 영역 */}
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type='file'
              ref={fileInputRef}
              accept='.xlsx,.xls'
              onChange={handleFileInput}
              className={styles.fileInput}
              id='material-excel-upload'
            />
            <label htmlFor='material-excel-upload' className={styles.uploadLabel}>
              <svg className={styles.uploadIcon} viewBox='0 0 24 24'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                <polyline points='14 2 14 8 20 8' />
                <line x1='12' y1='18' x2='12' y2='12' />
                <line x1='9' y1='15' x2='12' y2='12' />
                <line x1='15' y1='15' x2='12' y2='12' />
              </svg>
              <span className={styles.uploadText}>엑셀 파일을 드래그하거나 클릭하여 업로드 (.xlsx, .xls)</span>
            </label>
          </div>

          <p className={styles.hint}>
            * 다운로드 받은 엑셀 템플릿 형식을 유지해주세요.<br />
            * Lot No. + 자재(중분류) 조합으로 기존 데이터를 식별합니다.<br />
            * 기존에 없는 데이터는 신규 등록, 있는 데이터는 수정됩니다.
          </p>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>파일을 처리하는 중...</span>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && <div className={styles.error}>{error}</div>}

          {/* 성공 메시지 */}
          {successMessage && <div className={styles.success}>{successMessage}</div>}

          {/* 파싱된 데이터 미리보기 */}
          {parsedData && (
            <div className={styles.previewSection}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{fileName}</span>
                <span className={styles.rowCount}>총 {parsedData.rows.length}건</span>
                <button onClick={handleClear} className={styles.clearButton}>
                  초기화
                </button>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      <th>자재(중분류)</th>
                      <th>종류(소분류)</th>
                      <th>용도</th>
                      <th>제품명</th>
                      <th>규격</th>
                      <th>Lot No.</th>
                      <th>제조/공급처</th>
                      <th>국내/외</th>
                      <th>단위</th>
                      <th>가격</th>
                      <th>비고</th>
                      <th>재고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.category}</td>
                        <td>{row.type}</td>
                        <td>{row.purpose}</td>
                        <td>{row.name}</td>
                        <td>{row.spec}</td>
                        <td>{row.lotNo}</td>
                        <td>{row.company}</td>
                        <td>{row.origin}</td>
                        <td>{row.unit}</td>
                        <td>{row.price?.toLocaleString('ko-KR')}</td>
                        <td>{row.note}</td>
                        <td>{row.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose} disabled={isImporting}>
            취소
          </button>
          <button
            className={styles.importButton}
            onClick={handleImport}
            disabled={!parsedData || isImporting}
          >
            {isImporting ? (
              <>
                <span className={styles.buttonSpinner}></span>
                등록 중...
              </>
            ) : (
              '등록'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
