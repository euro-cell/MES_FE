import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getFormationWorklog, updateFormationWorklog } from '../../../../../api/project/worklog';
import type { FormationWorklog, FormationWorklogPayload } from './FormationTypes';
import { FORMATION_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

// 호기 선택 옵션
const UNIT_NUMBER_OPTIONS = ['11호기', '12호기', '13호기', '14호기', '15호기', '16호기'];

// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (투입 수량 - 불량 수량)
  'degas1GoodQuantity',
  'preFormationGoodQuantity',
  'degas2GoodQuantity',
  'cellPressGoodQuantity',
  'finalSealingGoodQuantity',
  'lotMarkingGoodQuantity',
  'mainFormationGoodQuantity',
  'ocv1GoodQuantity',
  // 불량률 (불량 수량 / 투입 수량 * 100)
  'degas1DefectRate',
  'preFormationDefectRate',
  'degas2DefectRate',
  'cellPressDefectRate',
  'finalSealingDefectRate',
  'lotMarkingDefectRate',
  'mainFormationDefectRate',
  'ocv1DefectRate',
];

// preFormation1~5UnitNumber, mainFormation1~5UnitNumber 필드에 대한 selectFields 설정
const FORMATION_SELECT_FIELDS: Record<string, string[]> = {
  preFormation1UnitNumber: UNIT_NUMBER_OPTIONS,
  preFormation2UnitNumber: UNIT_NUMBER_OPTIONS,
  preFormation3UnitNumber: UNIT_NUMBER_OPTIONS,
  preFormation4UnitNumber: UNIT_NUMBER_OPTIONS,
  preFormation5UnitNumber: UNIT_NUMBER_OPTIONS,
  mainFormation1UnitNumber: UNIT_NUMBER_OPTIONS,
  mainFormation2UnitNumber: UNIT_NUMBER_OPTIONS,
  mainFormation3UnitNumber: UNIT_NUMBER_OPTIONS,
  mainFormation4UnitNumber: UNIT_NUMBER_OPTIONS,
  mainFormation5UnitNumber: UNIT_NUMBER_OPTIONS,
};

export default function FormationEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('formation');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklogData, setWorklogData] = useState<FormationWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getFormationWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        // FormationWorklog 데이터를 Named Range에 맞춰 formValues로 변환
        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          if (rangeName === 'productionId' && project) {
            values[rangeName] = project.name;
          } else {
            values[rangeName] = (data as any)[rangeName] ?? '';
          }
        });
        setFormValues(values);
      } catch (err) {
        console.error('작업일지 조회 실패:', err);
        alert('작업일지를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges, project]);

  // 양품 수량 및 불량률 자동계산 함수
  const calculateAutoFields = (prev: Record<string, any>, rangeName: string, value: any): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['degas1', 'preFormation', 'degas2', 'cellPress', 'finalSealing', 'lotMarking', 'mainFormation', 'ocv1'];
    for (const process of processes) {
      const inputField = `${process}InputQuantity`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === inputField || rangeName === defectField) {
        const inputQty = rangeName === inputField ? value || 0 : prev[inputField] || 0;
        const defectQty = rangeName === defectField ? value || 0 : prev[defectField] || 0;
        // 양품 수량 = 투입 수량 - 불량 수량
        updates[goodField] = Math.max(0, Number(inputQty) - Number(defectQty));
        // 불량률 = (불량 수량 / 투입 수량) * 100
        updates[defectRateField] =
          Number(inputQty) > 0 ? Math.round((Number(defectQty) / Number(inputQty)) * 10000) / 100 : 0;
      }
    }

    return updates;
  };

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      ...calculateAutoFields(prev, rangeName, value),
    }));
  };

  const handleSave = async () => {
    if (!projectId || !worklogId) return;

    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, FORMATION_NUMERIC_FIELDS) as Partial<FormationWorklogPayload>;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateFormationWorklog(Number(projectId), Number(worklogId), payload);
      alert('작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Formation&process=Formation`);
    } catch (err) {
      alert('수정 실패: ' + err);
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('수정한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Formation&process=Formation`);
    }
  };

  if (templateLoading || loading) {
    return (
      <div className={styles.container}>
        <p>작업일지를 불러오는 중...</p>
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

  if (!workbook || !worklogData) {
    return (
      <div className={styles.container}>
        <p>작업일지를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 드롭다운 옵션 생성 및 기존 selectFields와 병합
  const plantOptions = plantEquipments.map(eq => eq.name);
  const formationSelectFields = {
    ...FORMATION_SELECT_FIELDS,
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };

  // 커스텀 placeholder 설정
  const placeholders: Record<string, string> = {
    preFormation1Quantity: '양품 수량',
    preFormation2Quantity: '양품 수량',
    preFormation3Quantity: '양품 수량',
    preFormation4Quantity: '양품 수량',
    preFormation5Quantity: '양품 수량',
    preFormation1CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation2CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation3CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation4CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation5CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation1Quantity: '양품 수량',
    mainFormation2Quantity: '양품 수량',
    mainFormation3Quantity: '양품 수량',
    mainFormation4Quantity: '양품 수량',
    mainFormation5Quantity: '양품 수량',
    mainFormation1CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation2CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation3CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation4CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation5CellNumberRange: '예: 1-5, 8, 10-15',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Formation 작업일지 수정</h2>
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
          multilineFields={['remark']}
          numericFields={FORMATION_NUMERIC_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={formationSelectFields}
          dateFields={['manufactureDate']}
          placeholders={placeholders}
        />
      </div>
    </div>
  );
}
