import { useState, useCallback, useEffect, useRef } from 'react';
import ExcelJS from 'exceljs';
import styles from '../../../../../styles/project/lot/10-RawDataGrid.module.css';
import { registerRawData } from '../LotService';

// 컬럼 타입 판별
type ColumnType = 'percent' | 'capacity' | 'voltage' | 'default';

const getColumnType = (key: string): ColumnType => {
  // 효율 (% 소수점 1자리): For.Eff, SOC
  if (key.includes('For.Eff') || key.endsWith(' SOC') || key === 'SOC') {
    return 'percent';
  }
  // 용량 (소수점 2자리): PFC, PFD, MFC, MFD, STC, STD, NCR2, Capacity, Wh
  if (
    key.includes('PFC') ||
    key.includes('PFD') ||
    key.includes('MFC') ||
    key.includes('MFD') ||
    key.includes('STC') ||
    key.includes('STD') ||
    key.includes('NCR2') ||
    key.includes('Capacity') ||
    key.includes('Wh')
  ) {
    return 'capacity';
  }
  // 전압/저항 (소수점 3자리): OCV, IR, Delta V, Nominal V, DC_IR
  if (
    key.includes('OCV') ||
    key.includes('IR') ||
    key.includes('Delta V') ||
    key.includes('Nominal V') ||
    key.includes('DC_IR')
  ) {
    return 'voltage';
  }
  return 'default';
};

// 컬럼 타입에 따른 숫자 포맷
const formatByColumnType = (value: string | number | null, columnType: ColumnType): string => {
  if (value === null || value === '') return '';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return String(value);

  switch (columnType) {
    case 'percent':
      return (num * 100).toFixed(1) + '%';
    case 'capacity':
      return num.toFixed(2);
    case 'voltage':
      return num.toFixed(3);
    default:
      return String(value);
  }
};

// RawData 전용 셀 값 포맷 함수 (기본 파싱용)
const formatRawDataCellValue = (value: any): string => {
  if (value === null || value === undefined) return '';

  // 수식 결과 처리
  if (typeof value === 'object' && 'result' in value) {
    return formatRawDataCellValue(value.result);
  }

  // 숫자는 원본 유지 (컬럼별 포맷은 별도 적용)
  if (typeof value === 'number') {
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

  // 기타 객체는 빈 문자열
  if (typeof value === 'object') {
    return '';
  }

  return String(value);
};

interface RawDataGridProps {
  projectId: number;
}

interface ExcelRow {
  [key: string]: string | number | null;
}

// 대분류 헤더 (병합 정보 포함)
interface HeaderGroup {
  label: string;
  colSpan: number;
}

interface ParsedExcelData {
  headerRow1: HeaderGroup[]; // 3행 - 대분류 (병합)
  headerRow2: string[]; // 4행 - 소분류
  dataKeys: string[]; // 데이터 접근용 키 (결합된 헤더)
  rows: ExcelRow[];
}

export default function RawDataGrid({ projectId }: RawDataGridProps) {
  const [excelData, setExcelData] = useState<ParsedExcelData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로딩 중 경과 시간 타이머
  useEffect(() => {
    if (isLoading) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading]);

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
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('워크시트를 찾을 수 없습니다.');
      }

      // 열 범위: C(3) ~ AF(32)
      const START_COL = 3; // C열
      const END_COL = 32; // AF열

      // 헤더 파싱
      const wsRow3 = worksheet.getRow(3);
      const wsRow4 = worksheet.getRow(4);

      // 3행 (대분류) - 병합된 셀 처리
      const row3Values: string[] = [];
      let lastVal3 = '';
      for (let col = START_COL; col <= END_COL; col++) {
        const cell3 = wsRow3.getCell(col);
        const val3 = formatRawDataCellValue(cell3.value);
        // 병합된 셀은 첫 번째 셀에만 값이 있고 나머지는 빈 값
        // 빈 값이면 이전 값을 유지
        if (val3) {
          lastVal3 = val3;
        }
        row3Values.push(lastVal3);
      }

      // 4행 (소분류)
      const headerRow2: string[] = [];
      for (let col = START_COL; col <= END_COL; col++) {
        const cell4 = wsRow4.getCell(col);
        const val4 = formatRawDataCellValue(cell4.value);
        headerRow2.push(val4 || `col_${col}`);
      }

      // 대분류 병합 그룹 계산
      const headerRow1: HeaderGroup[] = [];
      let currentGroup: HeaderGroup | null = null;
      for (let i = 0; i < row3Values.length; i++) {
        const val = row3Values[i];
        if (!currentGroup || currentGroup.label !== val) {
          if (currentGroup) {
            headerRow1.push(currentGroup);
          }
          currentGroup = { label: val, colSpan: 1 };
        } else {
          currentGroup.colSpan++;
        }
      }
      if (currentGroup) {
        headerRow1.push(currentGroup);
      }

      // 데이터 접근용 키 (대분류 + 소분류 결합)
      const dataKeys: string[] = [];
      for (let i = 0; i < row3Values.length; i++) {
        const key = row3Values[i] && headerRow2[i] ? `${row3Values[i]} ${headerRow2[i]}` : headerRow2[i];
        dataKeys.push(key);
      }

      // 데이터 파싱 (5행부터, C열에 값 없으면 종료)
      const rows: ExcelRow[] = [];
      for (let rowNum = 5; rowNum <= worksheet.rowCount; rowNum++) {
        const row = worksheet.getRow(rowNum);

        // C열(3번째)에 값이 없으면 종료
        const cellC = row.getCell(START_COL);
        const cellCValue = formatRawDataCellValue(cellC.value);
        if (!cellCValue) break;

        const rowData: ExcelRow = {};
        for (let col = START_COL; col <= END_COL; col++) {
          const cell = row.getCell(col);
          const key = dataKeys[col - START_COL];
          rowData[key] = formatRawDataCellValue(cell.value);
        }
        rows.push(rowData);
      }

      setExcelData({ headerRow1, headerRow2, dataKeys, rows });
    } catch (err) {
      console.error('엑셀 파싱 오류:', err);
      setError(err instanceof Error ? err.message : '파일 파싱에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 드래그 오버 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // 드래그 리브 핸들러
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // 드롭 핸들러
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // 파일 입력 핸들러
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // 초기화 핸들러
  const handleClear = useCallback(() => {
    setExcelData(null);
    setFileName('');
    setError(null);
    setSuccessMessage(null);
    // 파일 input 리셋 (같은 파일 재업로드 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 등록 핸들러
  const handleRegister = useCallback(async () => {
    if (!excelData) return;

    setIsRegistering(true);
    setError(null);
    setSuccessMessage(null);

    // 컬럼 타입에 따라 포맷 적용하여 저장
    // 용량: 소수점 2자리, 전압/저항: 소수점 3자리, 효율: % 소수점 1자리
    const formattedRows = excelData.rows.map(row => {
      const formattedRow: ExcelRow = {};
      for (const key of excelData.dataKeys) {
        const columnType = getColumnType(key);
        if (columnType !== 'default' && row[key] !== null && row[key] !== '') {
          formattedRow[key] = formatByColumnType(row[key], columnType);
        } else {
          formattedRow[key] = row[key];
        }
      }
      return formattedRow;
    });

    console.log('=== Raw Data 등록 요청 ===');
    console.log('rows:', formattedRows);

    try {
      const response = await registerRawData(projectId, excelData.dataKeys, formattedRows);
      setSuccessMessage(response.message);
      // 5초 후 성공 메시지 숨김
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '등록에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  }, [excelData, projectId]);

  return (
    <div className={styles.container}>
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
          id='excel-upload'
        />
        <label htmlFor='excel-upload' className={styles.uploadLabel}>
          <svg className={styles.uploadIcon} viewBox='0 0 24 24'>
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
            <polyline points='14 2 14 8 20 8' />
            <line x1='12' y1='18' x2='12' y2='12' />
            <line x1='9' y1='15' x2='12' y2='12' />
            <line x1='15' y1='15' x2='12' y2='12' />
          </svg>
          <span className={styles.uploadText}>Raw Data 파일을 드래그하거나 클릭하여 업로드</span>
          <span className={styles.fileTypes}>.xlsx, .xls 파일 지원</span>
        </label>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>파일을 처리하는 중... ({elapsedTime.toFixed(1)}초)</span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <div className={styles.error}>{error}</div>}

      {/* 파일 정보 및 테이블 */}
      {excelData && (
        <>
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{fileName}</span>
            <span className={styles.rowCount}>총 {excelData.rows.length}행</span>
            {successMessage && <span className={styles.successMessage}>{successMessage}</span>}
            <button onClick={handleRegister} className={styles.registerButton} disabled={isRegistering}>
              {isRegistering ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  등록 중...
                </>
              ) : (
                '등록'
              )}
            </button>
            <button onClick={handleClear} className={styles.clearButton}>
              초기화
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                {/* 1행: 대분류 (병합) */}
                <tr>
                  {excelData.headerRow1.map((group, idx) => (
                    <th key={idx} colSpan={group.colSpan} className={styles.headerGroup}>
                      {group.label}
                    </th>
                  ))}
                </tr>
                {/* 2행: 소분류 */}
                <tr>
                  {excelData.headerRow2.map((header, idx) => (
                    <th key={idx}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {excelData.dataKeys.map((key, colIdx) => {
                      const columnType = getColumnType(key);
                      const value = row[key];
                      const displayValue =
                        columnType !== 'default' && value !== null && value !== ''
                          ? formatByColumnType(value, columnType)
                          : (value ?? '');
                      return <td key={colIdx}>{displayValue}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 데이터 없음 */}
      {!excelData && !isLoading && !error && <div className={styles.noData}>Raw Data 파일을 업로드하세요.</div>}
    </div>
  );
}
