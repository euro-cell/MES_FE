import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useNotchingLots } from '../../shared/useNotchingLots';
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
      if (!projectId || !worklogId) return;

      try {
        const data = await getVdWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // 데이터를 formValues로 변환
        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,
          manufactureDate: data.manufactureDate ?? '',
          worker: data.worker ?? '',
          line: data.line ?? '',
          plant: data.plant ?? '',
          shift: data.shift ?? '',

          // 섹션2 - 전극 구분
          upperElectrode: data.upperElectrode ?? '',
          lowerElectrode: data.lowerElectrode ?? '',

          // 섹션2 - LOT (오븐번호×층번호)
          upperLot11: data.upperLot11 ?? '',
          upperLot12: data.upperLot12 ?? '',
          upperLot13: data.upperLot13 ?? '',
          upperLot21: data.upperLot21 ?? '',
          upperLot22: data.upperLot22 ?? '',
          upperLot23: data.upperLot23 ?? '',
          upperLot31: data.upperLot31 ?? '',
          upperLot32: data.upperLot32 ?? '',
          upperLot33: data.upperLot33 ?? '',
          lowerLot11: data.lowerLot11 ?? '',
          lowerLot12: data.lowerLot12 ?? '',
          lowerLot13: data.lowerLot13 ?? '',
          lowerLot21: data.lowerLot21 ?? '',
          lowerLot22: data.lowerLot22 ?? '',
          lowerLot23: data.lowerLot23 ?? '',
          lowerLot31: data.lowerLot31 ?? '',
          lowerLot32: data.lowerLot32 ?? '',
          lowerLot33: data.lowerLot33 ?? '',

          // 섹션2 - 투입량 (오븐번호×층번호)
          upperLotQty11: data.upperLotQty11 ?? '',
          upperLotQty12: data.upperLotQty12 ?? '',
          upperLotQty13: data.upperLotQty13 ?? '',
          upperLotQty21: data.upperLotQty21 ?? '',
          upperLotQty22: data.upperLotQty22 ?? '',
          upperLotQty23: data.upperLotQty23 ?? '',
          upperLotQty31: data.upperLotQty31 ?? '',
          upperLotQty32: data.upperLotQty32 ?? '',
          upperLotQty33: data.upperLotQty33 ?? '',
          lowerLotQty11: data.lowerLotQty11 ?? '',
          lowerLotQty12: data.lowerLotQty12 ?? '',
          lowerLotQty13: data.lowerLotQty13 ?? '',
          lowerLotQty21: data.lowerLotQty21 ?? '',
          lowerLotQty22: data.lowerLotQty22 ?? '',
          lowerLotQty23: data.lowerLotQty23 ?? '',
          lowerLotQty31: data.lowerLotQty31 ?? '',
          lowerLotQty32: data.lowerLotQty32 ?? '',
          lowerLotQty33: data.lowerLotQty33 ?? '',

          // 섹션3 - 투입량/수분측정/시간
          upperInputQuantity1: data.upperInputQuantity1 ?? '',
          upperInputQuantity2: data.upperInputQuantity2 ?? '',
          upperInputQuantity3: data.upperInputQuantity3 ?? '',
          upperMoistureMeasurement1: data.upperMoistureMeasurement1 ?? '',
          upperMoistureMeasurement2: data.upperMoistureMeasurement2 ?? '',
          upperMoistureMeasurement3: data.upperMoistureMeasurement3 ?? '',
          upperInputOutputTime: data.upperInputOutputTime ?? '',
          lowerInputQuantity1: data.lowerInputQuantity1 ?? '',
          lowerInputQuantity2: data.lowerInputQuantity2 ?? '',
          lowerInputQuantity3: data.lowerInputQuantity3 ?? '',
          lowerMoistureMeasurement1: data.lowerMoistureMeasurement1 ?? '',
          lowerMoistureMeasurement2: data.lowerMoistureMeasurement2 ?? '',
          lowerMoistureMeasurement3: data.lowerMoistureMeasurement3 ?? '',
          lowerInputOutputTime: data.lowerInputOutputTime ?? '',

          // 섹션3 - 두께 (상부 before/after)
          upperThicknessBefore1F1: data.upperThicknessBefore1F1 ?? '',
          upperThicknessBefore1F2: data.upperThicknessBefore1F2 ?? '',
          upperThicknessBefore1F3: data.upperThicknessBefore1F3 ?? '',
          upperThicknessBefore2F1: data.upperThicknessBefore2F1 ?? '',
          upperThicknessBefore2F2: data.upperThicknessBefore2F2 ?? '',
          upperThicknessBefore2F3: data.upperThicknessBefore2F3 ?? '',
          upperThicknessBefore3F1: data.upperThicknessBefore3F1 ?? '',
          upperThicknessBefore3F2: data.upperThicknessBefore3F2 ?? '',
          upperThicknessBefore3F3: data.upperThicknessBefore3F3 ?? '',
          upperThicknessAfter1F1: data.upperThicknessAfter1F1 ?? '',
          upperThicknessAfter1F2: data.upperThicknessAfter1F2 ?? '',
          upperThicknessAfter1F3: data.upperThicknessAfter1F3 ?? '',
          upperThicknessAfter2F1: data.upperThicknessAfter2F1 ?? '',
          upperThicknessAfter2F2: data.upperThicknessAfter2F2 ?? '',
          upperThicknessAfter2F3: data.upperThicknessAfter2F3 ?? '',
          upperThicknessAfter3F1: data.upperThicknessAfter3F1 ?? '',
          upperThicknessAfter3F2: data.upperThicknessAfter3F2 ?? '',
          upperThicknessAfter3F3: data.upperThicknessAfter3F3 ?? '',

          // 섹션3 - 두께 (하부 before/after)
          lowerThicknessBefore1F1: data.lowerThicknessBefore1F1 ?? '',
          lowerThicknessBefore1F2: data.lowerThicknessBefore1F2 ?? '',
          lowerThicknessBefore1F3: data.lowerThicknessBefore1F3 ?? '',
          lowerThicknessBefore2F1: data.lowerThicknessBefore2F1 ?? '',
          lowerThicknessBefore2F2: data.lowerThicknessBefore2F2 ?? '',
          lowerThicknessBefore2F3: data.lowerThicknessBefore2F3 ?? '',
          lowerThicknessBefore3F1: data.lowerThicknessBefore3F1 ?? '',
          lowerThicknessBefore3F2: data.lowerThicknessBefore3F2 ?? '',
          lowerThicknessBefore3F3: data.lowerThicknessBefore3F3 ?? '',
          lowerThicknessAfter1F1: data.lowerThicknessAfter1F1 ?? '',
          lowerThicknessAfter1F2: data.lowerThicknessAfter1F2 ?? '',
          lowerThicknessAfter1F3: data.lowerThicknessAfter1F3 ?? '',
          lowerThicknessAfter2F1: data.lowerThicknessAfter2F1 ?? '',
          lowerThicknessAfter2F2: data.lowerThicknessAfter2F2 ?? '',
          lowerThicknessAfter2F3: data.lowerThicknessAfter2F3 ?? '',
          lowerThicknessAfter3F1: data.lowerThicknessAfter3F1 ?? '',
          lowerThicknessAfter3F2: data.lowerThicknessAfter3F2 ?? '',
          lowerThicknessAfter3F3: data.lowerThicknessAfter3F3 ?? '',

          // 섹션4 - 공정 조건
          vacuumDegreeSetting: data.vacuumDegreeSetting ?? '',
          upperSetTemperature: data.upperSetTemperature ?? '',
          lowerSetTemperature: data.lowerSetTemperature ?? '',
          upperTimerTime: data.upperTimerTime ?? '',
          lowerTimerTime: data.lowerTimerTime ?? '',
        };

        setFormValues(values);
      } catch (err: any) {
        console.error('작업일지 조회 실패:', err);
        alert(getErrorMessage(err, '작업일지를 불러오지 못했습니다.'));
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId]);

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

    const payload: VdWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,
      manufactureDate: formValues.manufactureDate || '',
      worker: formValues.worker || '',
      line: formValues.line || '',
      plant: formValues.plant ? (plantEquipments.find(eq => eq.name === formValues.plant)?.id ?? null) : null,
      shift: formValues.shift || '',

      // 섹션2 - LOT (오븐번호×층번호)
      upperLot11: formValues.upperLot11,
      upperLot12: formValues.upperLot12,
      upperLot13: formValues.upperLot13,
      upperLot21: formValues.upperLot21,
      upperLot22: formValues.upperLot22,
      upperLot23: formValues.upperLot23,
      upperLot31: formValues.upperLot31,
      upperLot32: formValues.upperLot32,
      upperLot33: formValues.upperLot33,
      lowerLot11: formValues.lowerLot11,
      lowerLot12: formValues.lowerLot12,
      lowerLot13: formValues.lowerLot13,
      lowerLot21: formValues.lowerLot21,
      lowerLot22: formValues.lowerLot22,
      lowerLot23: formValues.lowerLot23,
      lowerLot31: formValues.lowerLot31,
      lowerLot32: formValues.lowerLot32,
      lowerLot33: formValues.lowerLot33,

      // 섹션2 - 투입량 (오븐번호×층번호)
      upperLotQty11: formValues.upperLotQty11 ? Number(formValues.upperLotQty11) : undefined,
      upperLotQty12: formValues.upperLotQty12 ? Number(formValues.upperLotQty12) : undefined,
      upperLotQty13: formValues.upperLotQty13 ? Number(formValues.upperLotQty13) : undefined,
      upperLotQty21: formValues.upperLotQty21 ? Number(formValues.upperLotQty21) : undefined,
      upperLotQty22: formValues.upperLotQty22 ? Number(formValues.upperLotQty22) : undefined,
      upperLotQty23: formValues.upperLotQty23 ? Number(formValues.upperLotQty23) : undefined,
      upperLotQty31: formValues.upperLotQty31 ? Number(formValues.upperLotQty31) : undefined,
      upperLotQty32: formValues.upperLotQty32 ? Number(formValues.upperLotQty32) : undefined,
      upperLotQty33: formValues.upperLotQty33 ? Number(formValues.upperLotQty33) : undefined,
      lowerLotQty11: formValues.lowerLotQty11 ? Number(formValues.lowerLotQty11) : undefined,
      lowerLotQty12: formValues.lowerLotQty12 ? Number(formValues.lowerLotQty12) : undefined,
      lowerLotQty13: formValues.lowerLotQty13 ? Number(formValues.lowerLotQty13) : undefined,
      lowerLotQty21: formValues.lowerLotQty21 ? Number(formValues.lowerLotQty21) : undefined,
      lowerLotQty22: formValues.lowerLotQty22 ? Number(formValues.lowerLotQty22) : undefined,
      lowerLotQty23: formValues.lowerLotQty23 ? Number(formValues.lowerLotQty23) : undefined,
      lowerLotQty31: formValues.lowerLotQty31 ? Number(formValues.lowerLotQty31) : undefined,
      lowerLotQty32: formValues.lowerLotQty32 ? Number(formValues.lowerLotQty32) : undefined,
      lowerLotQty33: formValues.lowerLotQty33 ? Number(formValues.lowerLotQty33) : undefined,

      // 섹션3 - 투입량/수분측정/시간
      upperInputQuantity1: formValues.upperInputQuantity1 ? Number(formValues.upperInputQuantity1) : undefined,
      upperInputQuantity2: formValues.upperInputQuantity2 ? Number(formValues.upperInputQuantity2) : undefined,
      upperInputQuantity3: formValues.upperInputQuantity3 ? Number(formValues.upperInputQuantity3) : undefined,
      upperMoistureMeasurement1: formValues.upperMoistureMeasurement1
        ? Number(formValues.upperMoistureMeasurement1)
        : undefined,
      upperMoistureMeasurement2: formValues.upperMoistureMeasurement2
        ? Number(formValues.upperMoistureMeasurement2)
        : undefined,
      upperMoistureMeasurement3: formValues.upperMoistureMeasurement3
        ? Number(formValues.upperMoistureMeasurement3)
        : undefined,
      upperInputOutputTime: formValues.upperInputOutputTime || undefined,
      lowerInputQuantity1: formValues.lowerInputQuantity1 ? Number(formValues.lowerInputQuantity1) : undefined,
      lowerInputQuantity2: formValues.lowerInputQuantity2 ? Number(formValues.lowerInputQuantity2) : undefined,
      lowerInputQuantity3: formValues.lowerInputQuantity3 ? Number(formValues.lowerInputQuantity3) : undefined,
      lowerMoistureMeasurement1: formValues.lowerMoistureMeasurement1
        ? Number(formValues.lowerMoistureMeasurement1)
        : undefined,
      lowerMoistureMeasurement2: formValues.lowerMoistureMeasurement2
        ? Number(formValues.lowerMoistureMeasurement2)
        : undefined,
      lowerMoistureMeasurement3: formValues.lowerMoistureMeasurement3
        ? Number(formValues.lowerMoistureMeasurement3)
        : undefined,
      lowerInputOutputTime: formValues.lowerInputOutputTime || undefined,
      upperElectrode: formValues.upperElectrode || undefined,
      lowerElectrode: formValues.lowerElectrode || undefined,

      // 섹션3 - 두께 (상부)
      upperThicknessBefore1F1: formValues.upperThicknessBefore1F1
        ? Number(formValues.upperThicknessBefore1F1)
        : undefined,
      upperThicknessBefore1F2: formValues.upperThicknessBefore1F2
        ? Number(formValues.upperThicknessBefore1F2)
        : undefined,
      upperThicknessBefore1F3: formValues.upperThicknessBefore1F3
        ? Number(formValues.upperThicknessBefore1F3)
        : undefined,
      upperThicknessBefore2F1: formValues.upperThicknessBefore2F1
        ? Number(formValues.upperThicknessBefore2F1)
        : undefined,
      upperThicknessBefore2F2: formValues.upperThicknessBefore2F2
        ? Number(formValues.upperThicknessBefore2F2)
        : undefined,
      upperThicknessBefore2F3: formValues.upperThicknessBefore2F3
        ? Number(formValues.upperThicknessBefore2F3)
        : undefined,
      upperThicknessBefore3F1: formValues.upperThicknessBefore3F1
        ? Number(formValues.upperThicknessBefore3F1)
        : undefined,
      upperThicknessBefore3F2: formValues.upperThicknessBefore3F2
        ? Number(formValues.upperThicknessBefore3F2)
        : undefined,
      upperThicknessBefore3F3: formValues.upperThicknessBefore3F3
        ? Number(formValues.upperThicknessBefore3F3)
        : undefined,
      upperThicknessAfter1F1: formValues.upperThicknessAfter1F1 ? Number(formValues.upperThicknessAfter1F1) : undefined,
      upperThicknessAfter1F2: formValues.upperThicknessAfter1F2 ? Number(formValues.upperThicknessAfter1F2) : undefined,
      upperThicknessAfter1F3: formValues.upperThicknessAfter1F3 ? Number(formValues.upperThicknessAfter1F3) : undefined,
      upperThicknessAfter2F1: formValues.upperThicknessAfter2F1 ? Number(formValues.upperThicknessAfter2F1) : undefined,
      upperThicknessAfter2F2: formValues.upperThicknessAfter2F2 ? Number(formValues.upperThicknessAfter2F2) : undefined,
      upperThicknessAfter2F3: formValues.upperThicknessAfter2F3 ? Number(formValues.upperThicknessAfter2F3) : undefined,
      upperThicknessAfter3F1: formValues.upperThicknessAfter3F1 ? Number(formValues.upperThicknessAfter3F1) : undefined,
      upperThicknessAfter3F2: formValues.upperThicknessAfter3F2 ? Number(formValues.upperThicknessAfter3F2) : undefined,
      upperThicknessAfter3F3: formValues.upperThicknessAfter3F3 ? Number(formValues.upperThicknessAfter3F3) : undefined,

      // 섹션3 - 두께 (하부)
      lowerThicknessBefore1F1: formValues.lowerThicknessBefore1F1
        ? Number(formValues.lowerThicknessBefore1F1)
        : undefined,
      lowerThicknessBefore1F2: formValues.lowerThicknessBefore1F2
        ? Number(formValues.lowerThicknessBefore1F2)
        : undefined,
      lowerThicknessBefore1F3: formValues.lowerThicknessBefore1F3
        ? Number(formValues.lowerThicknessBefore1F3)
        : undefined,
      lowerThicknessBefore2F1: formValues.lowerThicknessBefore2F1
        ? Number(formValues.lowerThicknessBefore2F1)
        : undefined,
      lowerThicknessBefore2F2: formValues.lowerThicknessBefore2F2
        ? Number(formValues.lowerThicknessBefore2F2)
        : undefined,
      lowerThicknessBefore2F3: formValues.lowerThicknessBefore2F3
        ? Number(formValues.lowerThicknessBefore2F3)
        : undefined,
      lowerThicknessBefore3F1: formValues.lowerThicknessBefore3F1
        ? Number(formValues.lowerThicknessBefore3F1)
        : undefined,
      lowerThicknessBefore3F2: formValues.lowerThicknessBefore3F2
        ? Number(formValues.lowerThicknessBefore3F2)
        : undefined,
      lowerThicknessBefore3F3: formValues.lowerThicknessBefore3F3
        ? Number(formValues.lowerThicknessBefore3F3)
        : undefined,
      lowerThicknessAfter1F1: formValues.lowerThicknessAfter1F1 ? Number(formValues.lowerThicknessAfter1F1) : undefined,
      lowerThicknessAfter1F2: formValues.lowerThicknessAfter1F2 ? Number(formValues.lowerThicknessAfter1F2) : undefined,
      lowerThicknessAfter1F3: formValues.lowerThicknessAfter1F3 ? Number(formValues.lowerThicknessAfter1F3) : undefined,
      lowerThicknessAfter2F1: formValues.lowerThicknessAfter2F1 ? Number(formValues.lowerThicknessAfter2F1) : undefined,
      lowerThicknessAfter2F2: formValues.lowerThicknessAfter2F2 ? Number(formValues.lowerThicknessAfter2F2) : undefined,
      lowerThicknessAfter2F3: formValues.lowerThicknessAfter2F3 ? Number(formValues.lowerThicknessAfter2F3) : undefined,
      lowerThicknessAfter3F1: formValues.lowerThicknessAfter3F1 ? Number(formValues.lowerThicknessAfter3F1) : undefined,
      lowerThicknessAfter3F2: formValues.lowerThicknessAfter3F2 ? Number(formValues.lowerThicknessAfter3F2) : undefined,
      lowerThicknessAfter3F3: formValues.lowerThicknessAfter3F3 ? Number(formValues.lowerThicknessAfter3F3) : undefined,

      // 섹션4 - 공정 조건
      vacuumDegreeSetting: formValues.vacuumDegreeSetting ? Number(formValues.vacuumDegreeSetting) : undefined,
      upperSetTemperature: formValues.upperSetTemperature ? Number(formValues.upperSetTemperature) : undefined,
      lowerSetTemperature: formValues.lowerSetTemperature ? Number(formValues.lowerSetTemperature) : undefined,
      upperTimerTime: formValues.upperTimerTime ? Number(formValues.upperTimerTime) : undefined,
      lowerTimerTime: formValues.lowerTimerTime ? Number(formValues.lowerTimerTime) : undefined,
    };

    setSubmitting(true);
    try {
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
