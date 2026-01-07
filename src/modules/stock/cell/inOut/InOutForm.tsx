import type { InOutFormData } from './types';
import { NCR_GRADES, STORAGE_LETTERS, STORAGE_NUMBERS } from './constants';
import styles from '../../../../styles/stock/cell/InOut.module.css';

interface InOutFormProps {
  formData: InOutFormData;
  projectList: string[];
  showLotWarning: boolean;
  isLotInputEnabled: boolean;
  isProjectSelected: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCellLotKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function InOutForm({
  formData,
  projectList,
  showLotWarning,
  isLotInputEnabled,
  isProjectSelected,
  onInputChange,
  onCellLotKeyDown,
  onSubmit,
}: InOutFormProps) {
  return (
    <form onSubmit={onSubmit}>
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
                  onChange={onInputChange}
                  className={styles.typeSelect}
                >
                  <option value='in'>입고</option>
                  <option value='out'>출고</option>
                  <option value='restock'>재입고</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>일자</label>
                <input type='date' name='cellLotDate' value={formData.cellLotDate} onChange={onInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Lot 입력</label>
                <input
                  type='text'
                  name='cellLot'
                  value={formData.cellLot}
                  onChange={onInputChange}
                  onKeyDown={onCellLotKeyDown}
                  placeholder='Lot 입력 또는 바코드 스캔'
                  lang='en'
                  disabled={!isLotInputEnabled}
                />
                {!isLotInputEnabled && (
                  <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ 인수자, 인계자, 프로젝트명을 입력해주세요
                  </div>
                )}
                {isLotInputEnabled && showLotWarning && (
                  <div style={{ color: '#ffa500', fontSize: '12px', marginTop: '4px' }}>
                    ℹ️ [한/영]키가 한글로 되어있습니다. <br /> 원활한 바코드 스캔을 위해 [한/영]키를 영어로
                    변경해주세요.
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
                  onChange={onInputChange}
                  placeholder='인수자'
                />
              </div>
              <div className={styles.formGroup}>
                <label>인계자</label>
                <input
                  type='text'
                  name='outPerson'
                  value={formData.outPerson}
                  onChange={onInputChange}
                  placeholder='인계자'
                />
              </div>
              <div className={styles.formGroup}>
                <label>출고현황</label>
                <input
                  type='text'
                  name='outStatus'
                  value={formData.outStatus}
                  onChange={onInputChange}
                  placeholder='출고현황'
                />
              </div>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input
                  type='text'
                  name='projectName'
                  value={formData.projectName}
                  onChange={onInputChange}
                  placeholder='Project Name 입력 또는 선택'
                  list='projectList'
                />
                <datalist id='projectList'>
                  {projectList.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className={styles.formGroup}>
                <label>Model</label>
                <input
                  type='text'
                  name='model'
                  value={formData.model}
                  onChange={onInputChange}
                  placeholder='Model'
                  disabled={isProjectSelected}
                />
              </div>
              <div className={styles.formGroup}>
                <label>등급</label>
                <select
                  name='grade'
                  value={formData.grade}
                  onChange={onInputChange}
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
                  onChange={onInputChange}
                  className={styles.typeSelect}
                  disabled={formData.grade !== 'NCR'}
                >
                  <option value=''>선택</option>
                  {NCR_GRADES.map(grade => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>보관 위치</label>
                <select
                  name='storageLocation'
                  value={formData.storageLocation}
                  onChange={onInputChange}
                  className={styles.typeSelect}
                >
                  <option value=''>선택</option>
                  {STORAGE_LETTERS.map(letter =>
                    STORAGE_NUMBERS.map(num => (
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
                  onChange={onInputChange}
                  placeholder='Project No.'
                  disabled={isProjectSelected}
                />
              </div>
              <div className={styles.formGroup}>
                <label>상세</label>
                <input
                  type='text'
                  name='details'
                  value={formData.details}
                  onChange={onInputChange}
                  placeholder='상세'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
