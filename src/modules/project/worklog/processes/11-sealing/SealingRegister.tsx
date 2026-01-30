import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { usePouchLots } from '../../shared/usePouchLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createSealingWorklog } from '../../../../../api/project/worklog';
import type { SealingWorklogPayload } from './SealingTypes';
import { SEALING_NUMERIC_FIELDS, SEALING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (파우치 LOT 선택 시 제조사 자동 입력)
const AUTO_FILL_FIELDS = ['pouchManufacturer'];
// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (작업 수량 - 불량 수량 - 폐기 수량)
  'topGoodQuantity',
  'sideGoodQuantity',
  'hipot3GoodQuantity',
  // 불량률 (불량 수량 / 작업 수량 * 100)
  'topDefectRate',
  'sideDefectRate',
  'hipot3DefectRate',
];

export default function SealingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('sealing');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { pouchLots } = usePouchLots();

  const [saving, setSaving] = useState(false);

  // 양품 수량 및 불량률 자동계산 헬퍼 함수
  const calculateAutoFields = (
    prev: Record<string, any>,
    rangeName: string,
    value: any
  ): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['top', 'side', 'hipot3'];
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

    return updates;
  };

  // 파우치 LOT 선택 시 제조사 자동 입력 + 양품 수량 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'pouchLot') {
      const selectedPouch = pouchLots.find(p => p.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        pouchManufacturer: selectedPouch?.manufacturer || '',
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
      const payload = mapFormToPayload(formValues, namedRanges, SEALING_NUMERIC_FIELDS) as SealingWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createSealingWorklog(Number(projectId), payload);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Sealing`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Sealing`);
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
  const pouchLotOptions = pouchLots.map(p => p.lot);
  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    // 파우치 LOT 선택박스
    pouchLot: pouchLotOptions,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Sealing 작업일지 등록</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
          <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
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
          multilineFields={['topChecklist', 'sideChecklist', 'bottomChecklist', 'remarkTop', 'remarkSide']}
          numericFields={SEALING_NUMERIC_FIELDS}
          integerFields={SEALING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={selectFields}
          dateFields={['manufactureDate']}
        />
      </div>
    </div>
  );
}
