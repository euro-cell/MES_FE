import { useState } from 'react';
import hangul from 'hangul-js';
import styles from '../../../../styles/stock/cell/InOut.module.css';

interface InOutFormData {
  cellLotType: 'in' | 'out';
  cellLotDate: string;
  cellLot: string;
  inPerson: string;
  outPerson: string;
  outStatus: string;
  projectName: string;
  model: string;
  grade: string;
  ncrGrade: string;
  storageLocation: string;
  projectNo: string;
  details: string;
  restriction: string;
}

interface TableData {
  projectName: string;
  grade: string;
  totalQty: number;
  holdingQty: number;
  inboundQty: number;
  outboundQty: number;
  other: string;
}

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 한글을 영어로 변환하는 함수 (QWERTY 자판)
const koreanToEnglish: { [key: string]: string } = {
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

const convertKoreanToEnglish = (str: string): string => {
  let result = '';
  const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

  for (let char of str) {
    if (koreanRegex.test(char)) {
      if (hangul.isHangul(char)) {
        // 완성된 한글 음절을 자음/모음으로 분해
        const decomposed = hangul.disassemble(char);
        result += decomposed.map((d: string) => koreanToEnglish[d] || d).join('');
      } else {
        // 낱개 자음/모음은 직접 매핑
        result += koreanToEnglish[char] || char;
      }
    } else {
      // 한글이 아니면 그대로
      result += char;
    }
  }
  return result;
};

export default function InOutIndex() {
  const [formData, setFormData] = useState<InOutFormData>({
    cellLotType: 'in',
    cellLotDate: getTodayDate(),
    cellLot: '',
    inPerson: '',
    outPerson: '',
    outStatus: '',
    projectName: '',
    model: '',
    grade: '양품',
    ncrGrade: '',
    storageLocation: '',
    projectNo: '',
    details: '',
    restriction: '',
  });

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [showLotWarning, setShowLotWarning] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // cellLot 필드는 한글 감지 시 경고
    if (name === 'cellLot') {
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value);
      if (hasKorean) {
        setShowLotWarning(true);
        setTimeout(() => setShowLotWarning(false), 2000);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddToTable = () => {
    if (!formData.projectName || !formData.grade) {
      alert('프로젝트명과 등급을 선택해주세요.');
      return;
    }

    // cellLot의 한글을 영어로 변환
    const convertedLot = convertKoreanToEnglish(formData.cellLot);

    const newRow: TableData = {
      projectName: formData.projectName,
      grade: formData.grade,
      totalQty: 0,
      holdingQty: 0,
      inboundQty: formData.cellLotType === 'in' ? 1 : 0,
      outboundQty: formData.cellLotType === 'out' ? 1 : 0,
      other: '',
    };

    setTableData([...tableData, newRow]);

    // cellLot만 초기화, 나머지 필드는 유지
    setFormData(prev => ({
      ...prev,
      cellLot: '',
    }));

    // 변환된 lot을 console에 출력 (백에 보낼 때 이 값 사용)
    console.log('Converted Lot:', convertedLot);
  };

  const handleCellLotKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 모든 keydown 이벤트 로깅 (바코드 스캐너 디버깅용)
    console.log('KeyDown Event:', {
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      keyCode: (e as any).keyCode,
    });
    // keyCode 16 (Shift 키) 무시
    if ((e as any).keyCode === 16) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const convertedLot = convertKoreanToEnglish(formData.cellLot);
      console.log('Form Data:', { ...formData, cellLot: convertedLot });
      handleAddToTable();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddToTable();
  };

  // Project Name별로 그룹화된 데이터 생성
  const groupedData = tableData.reduce((acc, row) => {
    const existing = acc.find(g => g.projectName === row.projectName);
    if (existing) {
      existing.rows.push(row);
    } else {
      acc.push({
        projectName: row.projectName,
        rows: [row],
      });
    }
    return acc;
  }, [] as { projectName: string; rows: TableData[] }[]);

  return (
    <div className={styles.inOutContainer}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <div className={styles.contentWrapper}>
            {/* 좌측: 셀 정보 */}
            <div className={styles.leftColumn}>
              <h4 className={styles.sectionTitle}>셀 정보</h4>
              <div className={styles.verticalFormGroup}>
                <div className={styles.formGroup}>
                  <label>구분</label>
                  <select
                    name='cellLotType'
                    value={formData.cellLotType}
                    onChange={handleInputChange}
                    className={styles.typeSelect}
                  >
                    <option value='in'>입고</option>
                    <option value='out'>출고</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>일자</label>
                  <input type='date' name='cellLotDate' value={formData.cellLotDate} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Lot 입력</label>
                  <input
                    type='text'
                    name='cellLot'
                    value={formData.cellLot}
                    onChange={handleInputChange}
                    onKeyDown={handleCellLotKeyDown}
                    placeholder='Lot 입력 또는 바코드 스캔'
                    lang='en'
                  />
                  {showLotWarning && (
                    <div style={{ color: '#ffa500', fontSize: '12px', marginTop: '4px' }}>
                      ℹ️ 한글이 입력되어 있습니다. 전송 시 영어로 변환됩니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 우측: 세부 정보 */}
            <div className={styles.rightColumn}>
              <h4 className={styles.sectionTitle}>세부 정보</h4>
              <div className={styles.gridContainer4Col}>
                <div className={styles.formGroup}>
                  <label>인수자</label>
                  <input
                    type='text'
                    name='inPerson'
                    value={formData.inPerson}
                    onChange={handleInputChange}
                    placeholder='인수자'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>인계자</label>
                  <input
                    type='text'
                    name='outPerson'
                    value={formData.outPerson}
                    onChange={handleInputChange}
                    placeholder='인계자'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>출고현황</label>
                  <input
                    type='text'
                    name='outStatus'
                    value={formData.outStatus}
                    onChange={handleInputChange}
                    placeholder='출고현황'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Project Name</label>
                  <input
                    type='text'
                    name='projectName'
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder='Project Name'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Model</label>
                  <input
                    type='text'
                    name='model'
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder='Model'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>등급</label>
                  <select
                    name='grade'
                    value={formData.grade}
                    onChange={handleInputChange}
                    className={styles.typeSelect}
                  >
                    <option value='양품'>양품</option>
                    <option value='NCR'>NCR</option>
                    <option value='NG'>NG</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>NCR 등급</label>
                  <select
                    name='ncrGrade'
                    value={formData.ncrGrade}
                    onChange={handleInputChange}
                    className={styles.typeSelect}
                    disabled={formData.grade !== 'NCR'}
                  >
                    <option value=''>선택</option>
                    <option value='F-NCR1'>F-NCR1</option>
                    <option value='F-NCR2'>F-NCR2</option>
                    <option value='F-NCR3'>F-NCR3</option>
                    <option value='F-NCR4'>F-NCR4</option>
                    <option value='F-NCR5'>F-NCR5</option>
                    <option value='F-NCR6'>F-NCR6</option>
                    <option value='F-NCR7'>F-NCR7</option>
                    <option value='F-NCR8'>F-NCR8</option>
                    <option value='NCR1'>NCR1</option>
                    <option value='NCR2'>NCR2</option>
                    <option value='NCR3'>NCR3</option>
                    <option value='NCR4'>NCR4</option>
                    <option value='NCR5'>NCR5</option>
                    <option value='NCR6'>NCR6</option>
                    <option value='NCR7'>NCR7</option>
                    <option value='NCR8'>NCR8</option>
                    <option value='NCR9'>NCR9</option>
                    <option value='NCR10'>NCR10</option>
                    <option value='NCR11'>NCR11</option>
                    <option value='기타-1'>기타 1</option>
                    <option value='기타-2'>기타 2</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>보관 위치</label>
                  <select
                    name='storageLocation'
                    value={formData.storageLocation}
                    onChange={handleInputChange}
                    className={styles.typeSelect}
                  >
                    <option value=''>선택</option>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(letter =>
                      [1, 2, 3, 4, 5].map(num => (
                        <option key={`${letter}-${num}`} value={`${letter}-${num}`}>
                          {letter}-{num}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Project No.</label>
                  <input
                    type='text'
                    name='projectNo'
                    value={formData.projectNo}
                    onChange={handleInputChange}
                    placeholder='Project No.'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>상세</label>
                  <input
                    type='text'
                    name='details'
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder='상세'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>재입고</label>
                  <select
                    name='restriction'
                    value={formData.restriction}
                    onChange={handleInputChange}
                    className={styles.typeSelect}
                  >
                    <option value=''>선택</option>
                    <option value='아니오'>아니오</option>
                    <option value='예'>예</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className={styles.divider}></div>

      <div className={styles.tableSection}>
        <table className={styles.dataTable}>
          <thead>
            <tr className={styles.titleRow}>
              <th colSpan={7}>프로젝트 별 Cell 입/출고 현황</th>
            </tr>
            <tr>
              <th>Project Name</th>
              <th>등급</th>
              <th>총 량</th>
              <th>보유 수량</th>
              <th>총 입고량</th>
              <th>총 출고량</th>
              <th>기타</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              groupedData.map((group, groupIdx) =>
                group.rows.map((row, rowIdx) => (
                  <tr key={`${groupIdx}-${rowIdx}`}>
                    {rowIdx === 0 && (
                      <td rowSpan={group.rows.length} className={styles.projectNameCell}>
                        {group.projectName}
                      </td>
                    )}
                    <td>{row.grade}</td>
                    <td>{row.totalQty}</td>
                    <td>{row.holdingQty}</td>
                    <td>{row.inboundQty}</td>
                    <td>{row.outboundQty}</td>
                    <td>{row.other || '-'}</td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
