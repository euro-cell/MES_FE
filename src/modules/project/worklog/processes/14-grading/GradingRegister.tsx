import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { GRADING_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import { createGradingWorklog } from './GradingService';
import type { GradingWorklogPayload } from './GradingTypes';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import { getLineEquipments } from '../../../../plant/register/EquipmentService';
import type { Equipment } from '../../../../plant/register/EquipmentTypes';
import { LABEL_CATEGORY_MAP, type CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

// 라인명 고정 옵션
const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

// 호기 선택 옵션
const UNIT_NUMBER_OPTIONS = ['11호기', '12호기', '13호기', '14호기', '15호기', '16호기'];

export default function GradingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('grading');
  const { namedRanges } = useNamedRanges(workbook);

  const [project, setProject] = useState<WorklogProject | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [plantEquipments, setPlantEquipments] = useState<Equipment[]>([]);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      try {
        const projectData = await getProject(Number(projectId));
        setProject(projectData);
      } catch (err) {
        console.error('프로젝트 조회 실패:', err);
      }
    };
    loadProject();
  }, [projectId]);

  // line(라인명) 선택 시 plant(사용 설비명) 목록 로드
  useEffect(() => {
    const loadPlantEquipments = async () => {
      const selectedLine = formValues.line as CategoryLabel;
      if (!selectedLine || !LABEL_CATEGORY_MAP[selectedLine]) {
        setPlantEquipments([]);
        return;
      }
      try {
        const category = LABEL_CATEGORY_MAP[selectedLine];
        const equipments = await getLineEquipments(category);
        setPlantEquipments(equipments);
      } catch (err) {
        console.error('설비 목록 조회 실패:', err);
        setPlantEquipments([]);
      }
    };
    loadPlantEquipments();
  }, [formValues.line]);

  useEffect(() => {
    if (Object.keys(namedRanges).length > 0) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const initialValues: Record<string, any> = {};
      Object.keys(namedRanges).forEach(rangeName => {
        if (rangeName === 'productionId' && project) {
          initialValues[rangeName] = project.name;
        } else if (rangeName === 'manufactureDate') {
          initialValues[rangeName] = today;
        } else {
          const defaultValue = namedRanges[rangeName]?.value;
          initialValues[rangeName] = defaultValue ?? '';
        }
      });
      setFormValues(initialValues);
    }
  }, [namedRanges, project]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [rangeName]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, GRADING_NUMERIC_FIELDS) as GradingWorklogPayload;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createGradingWorklog(Number(projectId), payload);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Formation&process=Grading`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Formation&process=Grading`);
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

  // 드롭다운 옵션 생성
  const plantOptions = plantEquipments.map(eq => eq.name);

  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    grading1UnitNumber: UNIT_NUMBER_OPTIONS,
    grading2UnitNumber: UNIT_NUMBER_OPTIONS,
    grading3UnitNumber: UNIT_NUMBER_OPTIONS,
    grading4UnitNumber: UNIT_NUMBER_OPTIONS,
    grading5UnitNumber: UNIT_NUMBER_OPTIONS,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Grading 작업일지 등록</h2>
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
          numericFields={GRADING_NUMERIC_FIELDS}
          readOnlyFields={COMMON_READONLY_FIELDS}
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
