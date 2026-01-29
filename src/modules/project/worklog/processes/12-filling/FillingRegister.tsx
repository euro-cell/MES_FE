import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useElectrolyteLots } from '../../shared/useElectrolyteLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { FILLING_NUMERIC_FIELDS, FILLING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import { createFillingWorklog } from '../../../../../api/project/worklog';
import type { FillingWorklogPayload } from './FillingTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 전해액 사용량 기본값 (자동계산 전 안내 문구)
const ELECTROLYTE_USAGE_PLACEHOLDER = 'Wetting 작업 수량 * 주액량(spec), kg 단위 변환';
// 자동입력 필드 (전해액 LOT 선택 시 제조사, 스팩 자동 입력)
const AUTO_FILL_FIELDS = ['electrolyteManufacturer', 'electrolyteSpec'];
// 자동계산 필드 (양품 수량, 불량률, 전해액 사용량)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (작업 수량 - 불량 수량 - 폐기 수량)
  'fillingGoodQuantity',
  'waitingGoodQuantity',
  // 불량률 (불량 수량 / 작업 수량 * 100)
  'fillingDefectRate',
  'waitingDefectRate',
  // 전해액 사용량 (주액량 스팩 * 웨이팅 작업 수량 / 1000)
  'electrolyteUsage',
];

export default function FillingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('filling');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { electrolyteLots } = useElectrolyteLots();

  const [saving, setSaving] = useState(false);

  // 전해액 사용량 기본값 설정 (자동계산 전 안내 문구)
  useEffect(() => {
    if (Object.keys(formValues).length > 0 && !formValues.electrolyteUsage) {
      setFormValues(prev => ({
        ...prev,
        electrolyteUsage: ELECTROLYTE_USAGE_PLACEHOLDER,
      }));
    }
  }, [formValues, setFormValues]);

  // 양품 수량, 불량률, 전해액 사용량 자동계산 헬퍼 함수
  const calculateAutoFields = (
    prev: Record<string, any>,
    rangeName: string,
    value: any
  ): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['filling', 'waiting'];
    for (const process of processes) {
      const workField = `${process}WorkQuantity`;
      const defectField = `${process}DefectQuantity`;
      const discardField = `${process}DiscardQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === workField || rangeName === defectField || rangeName === discardField) {
        const workQty = rangeName === workField ? (value || 0) : (prev[workField] || 0);
        const defectQty = rangeName === defectField ? (value || 0) : (prev[defectField] || 0);
        const discardQty = rangeName === discardField ? (value || 0) : (prev[discardField] || 0);
        // 양품 수량 = 작업 수량 - 불량 수량 - 폐기 수량
        updates[goodField] = Math.max(0, Number(workQty) - Number(defectQty) - Number(discardQty));
        // 불량률 = (불량 수량 / 작업 수량) * 100
        updates[defectRateField] = Number(workQty) > 0
          ? Math.round((Number(defectQty) / Number(workQty)) * 10000) / 100
          : 0;
      }
    }

    // 전해액 사용량 계산 (주액량 스팩 * 웨이팅 작업 수량 / 1000 -> g을 kg으로 변환)
    if (rangeName === 'fillingSpecInjectionAmount' || rangeName === 'waitingWorkQuantity') {
      const specAmount = rangeName === 'fillingSpecInjectionAmount' ? (value || 0) : (prev['fillingSpecInjectionAmount'] || 0);
      const waitingQty = rangeName === 'waitingWorkQuantity' ? (value || 0) : (prev['waitingWorkQuantity'] || 0);
      // 전해액 사용량 = 주액량 스팩(g) * 웨이팅 작업 수량 / 1000 (kg 변환)
      updates['electrolyteUsage'] = Math.round((Number(specAmount) * Number(waitingQty) / 1000) * 100) / 100;
    }

    return updates;
  };

  // 전해액 LOT 선택 시 제조사, 스팩 자동 입력 + 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'electrolyteLot') {
      const selectedElectrolyte = electrolyteLots.find(e => e.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        electrolyteManufacturer: selectedElectrolyte?.manufacturer || '',
        electrolyteSpec: selectedElectrolyte?.spec || '',
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        ...calculateAutoFields(prev, rangeName, value),
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, FILLING_NUMERIC_FIELDS) as FillingWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createFillingWorklog(Number(projectId), payload);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Filling`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Filling`);
    }
  };

  if (templateLoading) {
    return (
      <div className={styles.container}>
        <p>엑셀 템플릿을 불러오는 중...</p>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>엑셀 템플릿 로드 실패: {templateError.message}</p>
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className={styles.container}>
        <p>엑셀 템플릿을 불러올 수 없습니다.</p>
      </div>
    );
  }

  const plantOptions = plantEquipments.map(eq => eq.name);
  const electrolyteLotOptions = electrolyteLots.map(e => e.lot);
  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    // 전해액 LOT 선택박스
    electrolyteLot: electrolyteLotOptions,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Filling 작업일지 등록</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.cancelButton} disabled={saving}>
            취소
          </button>
          <button onClick={handleSave} className={styles.saveButton} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className={styles.excelWrapper}>
        <ExcelRenderer
          workbook={workbook}
          editableRanges={Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name))}
          cellValues={formValues}
          namedRanges={namedRanges}
          onCellChange={handleCellChange}
          multilineFields={['remark']}
          numericFields={FILLING_NUMERIC_FIELDS}
          integerFields={FILLING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={selectFields}
          dateFields={['manufactureDate']}
        />
      </div>

      <div className={styles.footer}>
        <p className={styles.hint}>파란색으로 표시된 셀에 값을 입력할 수 있습니다.</p>
      </div>
    </div>
  );
}
