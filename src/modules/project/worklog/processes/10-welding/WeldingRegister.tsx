import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useLeadTabLots } from '../../shared/useLeadTabLots';
import { useTapeLots } from '../../shared/useTapeLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createWeldingWorklog } from '../../../../../api/project/worklog';
import type { WeldingWorklogPayload } from './WeldingTypes';
import { WELDING_NUMERIC_FIELDS, WELDING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (LOT 선택 시 제조사, 스팩 자동 입력)
const AUTO_FILL_FIELDS = [
  'leadTabManufacturer', 'leadTabSpec',
  'leadTab2Manufacturer', 'leadTab2Spec',
  'piTapeManufacturer', 'piTapeSpec',
];
// 자동계산 필드 (양품 수량 = 작업 수량 - 불량 수량)
const AUTO_CALC_FIELDS = [
  'preWeldingGoodQuantity',
  'mainWeldingGoodQuantity',
  'hipot2GoodQuantity',
  'tapingGoodQuantity',
];

export default function WeldingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('welding');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { leadTabTypes, leadTab1Lots, leadTab2Lots } = useLeadTabLots(
    formValues.leadTabType,
    formValues.leadTab2Type
  );
  const { tapeLots } = useTapeLots();

  const [saving, setSaving] = useState(false);

  // 양품 수량 자동계산 헬퍼 함수
  const calculateAutoFields = (
    prev: Record<string, any>,
    rangeName: string,
    value: any
  ): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량 계산 (작업 수량 - 불량 수량)
    const processes = ['preWelding', 'mainWelding', 'hipot2', 'taping'];
    for (const process of processes) {
      const workField = `${process}WorkQuantity`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;

      if (rangeName === workField || rangeName === defectField) {
        const workQty = rangeName === workField ? (value || 0) : (prev[workField] || 0);
        const defectQty = rangeName === defectField ? (value || 0) : (prev[defectField] || 0);
        // 양품 수량 = 작업 수량 - 불량 수량
        updates[goodField] = Math.max(0, Number(workQty) - Number(defectQty));
      }
    }

    return updates;
  };

  // 리드탭 타입/LOT 선택 시 자동 입력 처리
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'leadTabType') {
      // 리드탭1 타입 변경 시 LOT, 제조사, 스팩 초기화
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        leadTabLot: '',
        leadTabManufacturer: '',
        leadTabSpec: '',
      }));
    } else if (rangeName === 'leadTabLot') {
      // 리드탭1 LOT 선택 시 제조사, 스팩 자동 입력
      const selectedLot = leadTab1Lots.find(l => l.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        leadTabManufacturer: selectedLot?.manufacturer || '',
        leadTabSpec: selectedLot?.spec || '',
      }));
    } else if (rangeName === 'leadTab2Type') {
      // 리드탭2 타입 변경 시 LOT, 제조사, 스팩 초기화
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        leadTab2Lot: '',
        leadTab2Manufacturer: '',
        leadTab2Spec: '',
      }));
    } else if (rangeName === 'leadTab2Lot') {
      // 리드탭2 LOT 선택 시 제조사, 스팩 자동 입력
      const selectedLot = leadTab2Lots.find(l => l.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        leadTab2Manufacturer: selectedLot?.manufacturer || '',
        leadTab2Spec: selectedLot?.spec || '',
      }));
    } else if (rangeName === 'piTapeLot') {
      // PI 테이프 LOT 선택 시 제조사, 스팩 자동 입력
      const selectedTape = tapeLots.find(t => t.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        piTapeManufacturer: selectedTape?.manufacturer || '',
        piTapeSpec: selectedTape?.spec || '',
      }));
    } else {
      // 양품 수량 자동계산 포함
      setFormValues(prev => ({
        ...prev,
        ...calculateAutoFields(prev, rangeName, value),
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, WELDING_NUMERIC_FIELDS) as WeldingWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createWeldingWorklog(Number(projectId), payload);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Welding`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Welding`);
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
  const leadTab1LotOptions = leadTab1Lots.map(l => l.lot);
  const leadTab2LotOptions = leadTab2Lots.map(l => l.lot);
  const tapeLotOptions = tapeLots.map(t => t.lot);
  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    // 리드탭 타입/LOT 선택박스 (항상 표시)
    leadTabType: leadTabTypes,
    leadTabLot: leadTab1LotOptions,
    leadTab2Type: leadTabTypes,
    leadTab2Lot: leadTab2LotOptions,
    // PI 테이프 LOT 선택박스
    piTapeLot: tapeLotOptions,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Welding 작업일지 등록</h2>
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
          multilineFields={['remark', 'preWeldingDefectRemark', 'mainWeldingDefectRemark', 'hipot2DefectRemark', 'tapingDefectRemark']}
          numericFields={WELDING_NUMERIC_FIELDS}
          integerFields={WELDING_INTEGER_FIELDS}
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
