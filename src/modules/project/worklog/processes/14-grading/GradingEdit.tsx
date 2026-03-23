import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getGradingWorklog, updateGradingWorklog } from '../../../../../api/project/worklog';
import type { GradingWorklog, GradingWorklogPayload } from './GradingTypes';
import { GRADING_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

// 호기 선택 옵션
const UNIT_NUMBER_OPTIONS = ['11호기', '12호기', '13호기', '14호기', '15호기', '16호기'];

// grading1~5UnitNumber 필드에 대한 selectFields 설정
const GRADING_SELECT_FIELDS: Record<string, string[]> = {
  grading1UnitNumber: UNIT_NUMBER_OPTIONS,
  grading2UnitNumber: UNIT_NUMBER_OPTIONS,
  grading3UnitNumber: UNIT_NUMBER_OPTIONS,
  grading4UnitNumber: UNIT_NUMBER_OPTIONS,
  grading5UnitNumber: UNIT_NUMBER_OPTIONS,
};

// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (투입 수량 - 불량 수량)
  'ocv2GoodQuantity',
  'irGoodQuantity',
  'hipotGoodQuantity',
  'gradingGoodQuantity',
  'ocv3GoodQuantity',
  // 불량률 (불량 수량 / 투입 수량 * 100)
  'ocv2DefectRate',
  'irDefectRate',
  'hipotDefectRate',
  'gradingDefectRate',
  'ocv3DefectRate',
];

export default function GradingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('grading');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklogData, setWorklogData] = useState<GradingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getGradingWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        // GradingWorklog 데이터를 Named Range에 맞춰 formValues로 변환
        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          if (rangeName === 'projectId' && project) {
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
    const processes = ['ocv2', 'ir', 'hipot', 'grading', 'ocv3'];
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

  // 자동계산 필드 툴팁 생성
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    const processes = ['ocv2', 'ir', 'hipot', 'grading', 'ocv3'];
    const processLabels: Record<string, string> = {
      ocv2: 'OCV2',
      ir: 'IR',
      hipot: 'HiPot',
      grading: 'Grading',
      ocv3: 'OCV3',
    };

    processes.forEach(process => {
      const label = processLabels[process];
      tips[`${process}GoodQuantity`] = `= ${label} 투입 수량 - ${label} 불량 수량`;
      tips[`${process}DefectRate`] = `= (${label} 불량 수량 / ${label} 투입 수량) × 100`;
    });

    return tips;
  }, []);

  // 수식 참조 정보 (호버 시 셀 하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = {
      blue: '#2196F3',
      green: '#4CAF50',
      orange: '#FF9800',
    };

    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    const processes = ['ocv2', 'ir', 'hipot', 'grading', 'ocv3'];
    const processLabels: Record<string, string> = {
      ocv2: 'OCV2',
      ir: 'IR',
      hipot: 'HiPot',
      grading: 'Grading',
      ocv3: 'OCV3',
    };

    processes.forEach(process => {
      const label = processLabels[process];
      // 양품 수량 수식 참조
      refs[`${process}GoodQuantity`] = {
        formula: `= ${label} 투입 수량 - ${label} 불량 수량`,
        refs: [
          { field: `${process}InputQuantity`, label: `${label} 투입 수량`, color: COLORS.blue },
          { field: `${process}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.green },
        ],
      };
      // 불량률 수식 참조
      refs[`${process}DefectRate`] = {
        formula: `= (${label} 불량 수량 / ${label} 투입 수량) × 100`,
        refs: [
          { field: `${process}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.blue },
          { field: `${process}InputQuantity`, label: `${label} 투입 수량`, color: COLORS.green },
        ],
      };
    });

    return refs;
  }, []);

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
      const payload = mapFormToPayload(formValues, namedRanges, GRADING_NUMERIC_FIELDS) as Partial<GradingWorklogPayload>;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateGradingWorklog(Number(projectId), Number(worklogId), payload);
      alert('작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Formation&process=Grading`);
    } catch (err) {
      alert('수정 실패: ' + err);
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('수정한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Formation&process=Grading`);
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
  const gradingSelectFields = {
    ...GRADING_SELECT_FIELDS,
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };

  // 커스텀 placeholder 설정
  const placeholders: Record<string, string> = {
    grading1Quantity: '양품 수량',
    grading2Quantity: '양품 수량',
    grading3Quantity: '양품 수량',
    grading4Quantity: '양품 수량',
    grading5Quantity: '양품 수량',
    grading1CellNumberRange: '예: 1-5, 8, 10-15',
    grading2CellNumberRange: '예: 1-5, 8, 10-15',
    grading3CellNumberRange: '예: 1-5, 8, 10-15',
    grading4CellNumberRange: '예: 1-5, 8, 10-15',
    grading5CellNumberRange: '예: 1-5, 8, 10-15',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Grading 작업일지 수정</h2>
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
          numericFields={GRADING_NUMERIC_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={gradingSelectFields}
          dateFields={['manufactureDate']}
          placeholders={placeholders}
          tooltips={fieldTooltips}
          formulaRefs={formulaRefs}
        />
      </div>

    </div>
  );
}
