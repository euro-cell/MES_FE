import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getPressWorklog, updatePressWorklog } from '../../../../../api/project/worklog';
import type { PressWorklog, PressWorklogPayload } from './PressTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { PRESS_NUMERIC_FIELDS, PRESS_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import { getErrorMessage } from '../../../../../api/errorHandler';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

export default function PressEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Press');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklog, setWorklog] = useState<PressWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);

  // 작업일지 데이터 로드
  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getPressWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // namedRanges 기반으로 동적으로 formValues 생성
        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          if (rangeName === 'projectId' && project) {
            values[rangeName] = project.name;
          } else {
            values[rangeName] = (data as any)[rangeName] ?? '';
          }
        });

        setFormValues(values);
      } catch (err: any) {
        console.error('작업일지 조회 실패:', err);
        alert(getErrorMessage(err, '작업일지를 불러오지 못했습니다.'));
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges, project]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [rangeName]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!projectId || !worklogId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, PRESS_NUMERIC_FIELDS) as PressWorklogPayload;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updatePressWorklog(Number(projectId), Number(worklogId), payload);
      alert('Press 작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Press`);
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (templateLoading || loading) return <p>데이터를 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook || !worklog) return <p>데이터를 불러올 수 없습니다.</p>;

  const editableRanges = Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name));

  // 드롭다운 옵션 생성
  const plantOptions = plantEquipments.map(eq => eq.name);
  const pressSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Press 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
          <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/project/log/${projectId}?category=Electrode&process=Press`)}>
            취소
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '수정 중...' : '수정'}
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
        numericFields={PRESS_NUMERIC_FIELDS}
        integerFields={PRESS_INTEGER_FIELDS}
        readOnlyFields={COMMON_READONLY_FIELDS}
        selectFields={pressSelectFields}
        dateFields={['manufactureDate']}
      />
    </div>
  );
}
