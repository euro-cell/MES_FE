import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getNotchingWorklog, updateNotchingWorklog } from '../../../../../api/project/worklog';
import type { NotchingWorklog, NotchingWorklogPayload } from './NotchingTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { NOTCHING_NUMERIC_FIELDS, NOTCHING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (양품 수량 = 타발 수량 - 불량 수량)
const NOTCHING_AUTO_FILL_FIELDS = ['goodQuantity1', 'goodQuantity2', 'goodQuantity3', 'goodQuantity4', 'goodQuantity5'];

export default function NotchingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Notching');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklog, setWorklog] = useState<NotchingWorklog | null>(null);
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
        const data = await getNotchingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // namedRanges 기반으로 동적으로 formValues 생성
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
        alert('작업일지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges, project]);

  // 양품 수량 자동계산 (타발 수량 - 불량 수량)
  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => {
      const newValues = { ...prev, [rangeName]: value };

      // notchingQuantity 또는 defectQuantity 변경 시 goodQuantity 자동계산
      for (let i = 1; i <= 5; i++) {
        if (rangeName === `notchingQuantity${i}` || rangeName === `defectQuantity${i}`) {
          const notching = parseInt(newValues[`notchingQuantity${i}`]) || 0;
          const defect = parseInt(newValues[`defectQuantity${i}`]) || 0;
          newValues[`goodQuantity${i}`] = notching - defect;
        }
      }

      return newValues;
    });
  };

  const handleSubmit = async () => {
    if (!projectId || !worklogId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, NOTCHING_NUMERIC_FIELDS) as NotchingWorklogPayload;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateNotchingWorklog(Number(projectId), Number(worklogId), payload);
      alert('Notching 작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Notching`);
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

  const editableRanges = Object.keys(namedRanges).filter(name => ![...COMMON_READONLY_FIELDS, ...NOTCHING_AUTO_FILL_FIELDS].includes(name));

  // 드롭다운 옵션 생성
  const plantOptions = plantEquipments.map(eq => eq.name);
  const notchingSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Notching 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
          <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/project/log/${projectId}?category=Electrode&process=Notching`)}>
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
        numericFields={NOTCHING_NUMERIC_FIELDS}
        integerFields={NOTCHING_INTEGER_FIELDS}
        readOnlyFields={[...COMMON_READONLY_FIELDS, ...NOTCHING_AUTO_FILL_FIELDS]}
        selectFields={notchingSelectFields}
        dateFields={['manufactureDate']}
      />
    </div>
  );
}
