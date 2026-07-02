import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useNotchingLots } from '../../shared/useNotchingLots';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getVdWorklog, updateVdWorklog } from '../../../../../api/project/worklog';
import type { VdWorklog, VdWorklogPayload } from './VdTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { VD_NUMERIC_FIELDS, VD_INTEGER_FIELDS, VD_TIME_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import { getErrorMessage } from '../../../../../api/errorHandler';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

export default function VdEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Vd');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklog, setWorklog] = useState<VdWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { cathodeLots, anodeLots } = useNotchingLots(projectId);

  // 작업일지 데이터 로드
  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getVdWorklog(Number(projectId), Number(worklogId));
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
    setFormValues(prev => {
      const next = { ...prev, [rangeName]: value };

      // 오븐별 LOT 투입량 변경 시 층별 합계 자동계산
      // upperInputQuantity{층} = upperLotQty1{층} + upperLotQty2{층} + upperLotQty3{층}
      if (rangeName.match(/^(upper|lower)LotQty[123][123]$/)) {
        for (const side of ['upper', 'lower'] as const) {
          for (const floor of ['1', '2', '3']) {
            const sum = ['1', '2', '3'].reduce((acc, oven) => {
              const v = Number(next[`${side}LotQty${oven}${floor}`]) || 0;
              return acc + v;
            }, 0);
            next[`${side}InputQuantity${floor}`] = sum || '';
          }
        }
      }

      return next;
    });
  };

  const handleSubmit = async () => {
    if (!projectId || !worklogId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, VD_NUMERIC_FIELDS) as VdWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateVdWorklog(Number(projectId), Number(worklogId), payload);
      alert('VD 작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=VD`);
    } catch (err) {
      console.error('수정 실패:', err);
      alert(getErrorMessage(err, '수정에 실패했습니다.'));
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

  const upperLots = formValues.upperElectrode === '양극' ? cathodeLots
    : formValues.upperElectrode === '음극' ? anodeLots
    : null;

  const lowerLots = formValues.lowerElectrode === '양극' ? cathodeLots
    : formValues.lowerElectrode === '음극' ? anodeLots
    : null;

  const vdSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    upperElectrode: ['양극', '음극'],
    lowerElectrode: ['양극', '음극'],
    // 섹션2 - LOT: 전극 구분 선택 후에만 드롭다운 활성화
    ...(upperLots && Object.fromEntries(
      ['1', '2', '3'].flatMap(oven =>
        ['1', '2', '3'].map(floor => [`upperLot${oven}${floor}`, upperLots]),
      ),
    )),
    ...(lowerLots && Object.fromEntries(
      ['1', '2', '3'].flatMap(oven =>
        ['1', '2', '3'].map(floor => [`lowerLot${oven}${floor}`, lowerLots]),
      ),
    )),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>VD 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
          <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnCancel}
            onClick={() => navigate(`/project/log/${projectId}?category=Assembly&process=VD`)}
          >
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
        numericFields={VD_NUMERIC_FIELDS}
        integerFields={VD_INTEGER_FIELDS}
        readOnlyFields={[
          ...COMMON_READONLY_FIELDS,
          'upperInputQuantity1', 'upperInputQuantity2', 'upperInputQuantity3',
          'lowerInputQuantity1', 'lowerInputQuantity2', 'lowerInputQuantity3',
        ]}
        selectFields={vdSelectFields}
        dateFields={['manufactureDate']}
        timeFields={VD_TIME_FIELDS}
        multilineFields={['remark']}
      />
    </div>
  );
}
