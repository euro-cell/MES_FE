import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useSeparatorLots } from '../../shared/useSeparatorLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { STACKING_NUMERIC_FIELDS, STACKING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import { createStackingWorklog } from '../../../../../api/project/worklog';
import type { StackingWorklogPayload } from './StackingTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (분리막 LOT 선택 시 제조사, 스팩 자동 입력)
const SEPARATOR_AUTO_FILL_FIELDS = ['separatorManufacturer', 'separatorSpec'];
// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (투입량 - 불량 수량)
  'stackGoodQuantity',
  'hipot1GoodQuantity',
  // 불량률 (불량 수량 / 투입량 * 100)
  'stackDefectRate',
  'hipot1DefectRate',
];

export default function StackingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('stacking');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { separatorLots } = useSeparatorLots();

  const [saving, setSaving] = useState(false);

  // 양품 수량 및 불량률 자동계산 헬퍼 함수
  const calculateAutoFields = (
    prev: Record<string, any>,
    rangeName: string,
    value: any
  ): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['stack', 'hipot1'];
    for (const process of processes) {
      const inputField = `${process}ActualInput`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === inputField || rangeName === defectField) {
        const inputQty = rangeName === inputField ? (value || 0) : (prev[inputField] || 0);
        const defectQty = rangeName === defectField ? (value || 0) : (prev[defectField] || 0);
        // 양품 수량 = 투입량 - 불량 수량
        updates[goodField] = Math.max(0, Number(inputQty) - Number(defectQty));
        // 불량률 = (불량 수량 / 투입량) * 100
        updates[defectRateField] = Number(inputQty) > 0
          ? Math.round((Number(defectQty) / Number(inputQty)) * 10000) / 100
          : 0;
      }
    }

    return updates;
  };

  // 분리막 LOT 선택 시 제조사, 스팩 자동 입력 + 양품 수량 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'separatorLot') {
      const selectedSeparator = separatorLots.find(s => s.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        separatorManufacturer: selectedSeparator?.manufacturer || '',
        separatorSpec: selectedSeparator?.spec || '',
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
      const payload = mapFormToPayload(formValues, namedRanges, STACKING_NUMERIC_FIELDS) as StackingWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createStackingWorklog(Number(projectId), payload);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Stacking`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Stacking`);
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
  const separatorLotOptions = separatorLots.map(s => s.lot);
  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    ...(separatorLotOptions.length > 0 && { separatorLot: separatorLotOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Stacking 작업일지 등록</h2>
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
          timeFields={['jr1WorkTime', 'jr2WorkTime', 'jr3WorkTime', 'jr4WorkTime']}
          numericFields={STACKING_NUMERIC_FIELDS}
          integerFields={STACKING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...SEPARATOR_AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
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
