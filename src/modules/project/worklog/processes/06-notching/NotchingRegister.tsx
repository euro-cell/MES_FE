import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createNotchingWorklog } from './NotchingService';
import type { NotchingWorklogPayload } from './NotchingTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import { getLineEquipments } from '../../../../plant/register/EquipmentService';
import type { Equipment } from '../../../../plant/register/EquipmentTypes';
import { LABEL_CATEGORY_MAP, type CategoryLabel } from '../../shared/processCategories';
import { NOTCHING_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';

// 라인명 고정 옵션
const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

export default function NotchingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Notching');
  const { namedRanges } = useNamedRanges(workbook);

  const [project, setProject] = useState<WorklogProject | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [plantEquipments, setPlantEquipments] = useState<Equipment[]>([]);

  // 프로젝트 정보 로드
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      try {
        const proj = await getProject(Number(projectId));
        setProject(proj);
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

  // 초기 폼 값 설정
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
    setFormValues(prev => ({ ...prev, [rangeName]: value }));
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, NOTCHING_NUMERIC_FIELDS) as NotchingWorklogPayload;
      await createNotchingWorklog(Number(projectId), payload);
      alert('Notching 작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Notching`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (templateLoading) return <p>템플릿을 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook) return <p>엑셀 데이터를 불러올 수 없습니다.</p>;

  const editableRanges = Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name));

  // 드롭다운 옵션 생성
  const plantOptions = plantEquipments.map(eq => eq.name);

  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Notching 작업일지 등록</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnCancel}
            onClick={() => navigate(`/project/log/${projectId}?category=Electrode&process=Notching`)}
          >
            취소
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>

      <ExcelRenderer
        workbook={workbook}
        editableRanges={editableRanges}
        cellValues={formValues}
        namedRanges={namedRanges}
        onCellChange={handleCellChange}
        className={styles.excelRenderer}
        numericFields={NOTCHING_NUMERIC_FIELDS}
        readOnlyFields={COMMON_READONLY_FIELDS}
        selectFields={selectFields}
        dateFields={['manufactureDate']}
      />
    </div>
  );
}
