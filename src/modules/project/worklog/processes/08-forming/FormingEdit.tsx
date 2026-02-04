import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { usePouchLots } from '../../shared/usePouchLots';
import { getFormingWorklog, updateFormingWorklog } from '../../../../../api/project/worklog';
import type { FormingWorklog, FormingWorklogPayload } from './FormingTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { FORMING_NUMERIC_FIELDS, FORMING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (파우치 LOT 선택 시 제조사, 스팩 자동 입력)
const POUCH_AUTO_FILL_FIELDS = ['pouchManufacturer', 'pouchSpec'];
// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (작업 수량 - 불량 수량)
  'cuttingGoodQuantity',
  'formingGoodQuantity',
  'foldingGoodQuantity',
  'topCuttingGoodQuantity',
  // 불량률 (불량 수량 / 작업 수량 * 100)
  'cuttingDefectRate',
  'formingDefectRate',
  'foldingDefectRate',
  'topCuttingDefectRate',
];

export default function FormingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Forming');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklog, setWorklog] = useState<FormingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { pouchLots } = usePouchLots();

  // 자동계산 필드 툴팁
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    const processes = [
      { key: 'cutting', label: '컷팅' },
      { key: 'forming', label: '포밍' },
      { key: 'folding', label: '폴딩' },
      { key: 'topCutting', label: '탑컷팅' },
    ];
    for (const { key, label } of processes) {
      tips[`${key}GoodQuantity`] = `= ${label} 작업 수량 - ${label} 불량 수량`;
      tips[`${key}DefectRate`] = `= (${label} 불량 수량 / ${label} 작업 수량) × 100`;
    }
    return tips;
  }, []);

  // 자동계산 필드 참조 (하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = { blue: '#2196F3', green: '#4CAF50', orange: '#FF9800' };
    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    const processes = [
      { key: 'cutting', label: '컷팅' },
      { key: 'forming', label: '포밍' },
      { key: 'folding', label: '폴딩' },
      { key: 'topCutting', label: '탑컷팅' },
    ];
    for (const { key, label } of processes) {
      refs[`${key}GoodQuantity`] = {
        formula: `= ${label} 작업 수량 - ${label} 불량 수량`,
        refs: [
          { field: `${key}WorkQuantity`, label: `${label} 작업 수량`, color: COLORS.blue },
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.green },
        ],
      };
      refs[`${key}DefectRate`] = {
        formula: `= (${label} 불량 수량 / ${label} 작업 수량) × 100`,
        refs: [
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.blue },
          { field: `${key}WorkQuantity`, label: `${label} 작업 수량`, color: COLORS.green },
        ],
      };
    }
    return refs;
  }, []);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId) return;

      try {
        const data = await getFormingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          pouchLot: data.pouchLot ?? '',
          pouchManufacturer: data.pouchManufacturer ?? '',
          pouchSpec: data.pouchSpec ?? '',
          pouchUsage: data.pouchUsage ?? '',

          // B. 생산 정보 - 컷팅
          cuttingWorkQuantity: data.cuttingWorkQuantity ?? '',
          cuttingGoodQuantity: data.cuttingGoodQuantity ?? '',
          cuttingDefectQuantity: data.cuttingDefectQuantity ?? '',
          cuttingDiscardQuantity: data.cuttingDiscardQuantity ?? '',
          cuttingDefectRate: data.cuttingDefectRate ?? '',

          // B. 생산 정보 - 포밍
          formingWorkQuantity: data.formingWorkQuantity ?? '',
          formingGoodQuantity: data.formingGoodQuantity ?? '',
          formingDefectQuantity: data.formingDefectQuantity ?? '',
          formingDiscardQuantity: data.formingDiscardQuantity ?? '',
          formingDefectRate: data.formingDefectRate ?? '',

          // B. 생산 정보 - 폴딩
          foldingWorkQuantity: data.foldingWorkQuantity ?? '',
          foldingGoodQuantity: data.foldingGoodQuantity ?? '',
          foldingDefectQuantity: data.foldingDefectQuantity ?? '',
          foldingDiscardQuantity: data.foldingDiscardQuantity ?? '',
          foldingDefectRate: data.foldingDefectRate ?? '',

          // B. 생산 정보 - 탑컷팅
          topCuttingWorkQuantity: data.topCuttingWorkQuantity ?? '',
          topCuttingGoodQuantity: data.topCuttingGoodQuantity ?? '',
          topCuttingDefectQuantity: data.topCuttingDefectQuantity ?? '',
          topCuttingDiscardQuantity: data.topCuttingDiscardQuantity ?? '',
          topCuttingDefectRate: data.topCuttingDefectRate ?? '',

          // C. 공정 조건
          cuttingLength: data.cuttingLength ?? '',
          cuttingChecklist: data.cuttingChecklist ?? '',
          formingDepth: data.formingDepth ?? '',
          formingStopperHeight: data.formingStopperHeight ?? '',
          formingChecklist: data.formingChecklist ?? '',
          topCuttingLength: data.topCuttingLength ?? '',
          topCuttingChecklist: data.topCuttingChecklist ?? '',
        };

        setFormValues(values);
      } catch (err) {
        console.error('작업일지 조회 실패:', err);
        alert('작업일지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId]);

  // 양품 수량 및 불량률 자동계산 헬퍼 함수
  const calculateAutoFields = (
    prev: Record<string, any>,
    rangeName: string,
    value: any
  ): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['cutting', 'forming', 'folding', 'topCutting'];
    for (const process of processes) {
      const workField = `${process}WorkQuantity`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === workField || rangeName === defectField) {
        const workQty = rangeName === workField ? (value || 0) : (prev[workField] || 0);
        const defectQty = rangeName === defectField ? (value || 0) : (prev[defectField] || 0);
        // 양품 수량 = 작업 수량 - 불량 수량
        updates[goodField] = Math.max(0, Number(workQty) - Number(defectQty));
        // 불량률 = (불량 수량 / 작업 수량) * 100
        updates[defectRateField] = Number(workQty) > 0
          ? Math.round((Number(defectQty) / Number(workQty)) * 10000) / 100
          : 0;
      }
    }

    return updates;
  };

  // 파우치 LOT 선택 시 제조사, 스팩 자동 입력 + 양품 수량 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'pouchLot') {
      const selectedPouch = pouchLots.find(p => p.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        pouchManufacturer: selectedPouch?.manufacturer || '',
        pouchSpec: selectedPouch?.spec || '',
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        ...calculateAutoFields(prev, rangeName, value),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!projectId || !worklogId) return;

    const payload: FormingWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,
      line: formValues.line || undefined,
      plant: formValues.plant ? (plantEquipments.find(eq => eq.name === formValues.plant)?.id ?? null) : null,

      // A. 자재 투입 정보
      pouchLot: formValues.pouchLot,
      pouchManufacturer: formValues.pouchManufacturer,
      pouchSpec: formValues.pouchSpec,
      pouchUsage: formValues.pouchUsage ? Number(formValues.pouchUsage) : undefined,

      // B. 생산 정보 - 컷팅
      cuttingWorkQuantity: formValues.cuttingWorkQuantity ? Number(formValues.cuttingWorkQuantity) : undefined,
      cuttingGoodQuantity: formValues.cuttingGoodQuantity ? Number(formValues.cuttingGoodQuantity) : undefined,
      cuttingDefectQuantity: formValues.cuttingDefectQuantity ? Number(formValues.cuttingDefectQuantity) : undefined,
      cuttingDiscardQuantity: formValues.cuttingDiscardQuantity ? Number(formValues.cuttingDiscardQuantity) : undefined,
      cuttingDefectRate: formValues.cuttingDefectRate ? Number(formValues.cuttingDefectRate) : undefined,

      // B. 생산 정보 - 포밍
      formingWorkQuantity: formValues.formingWorkQuantity ? Number(formValues.formingWorkQuantity) : undefined,
      formingGoodQuantity: formValues.formingGoodQuantity ? Number(formValues.formingGoodQuantity) : undefined,
      formingDefectQuantity: formValues.formingDefectQuantity ? Number(formValues.formingDefectQuantity) : undefined,
      formingDiscardQuantity: formValues.formingDiscardQuantity ? Number(formValues.formingDiscardQuantity) : undefined,
      formingDefectRate: formValues.formingDefectRate ? Number(formValues.formingDefectRate) : undefined,

      // B. 생산 정보 - 폴딩
      foldingWorkQuantity: formValues.foldingWorkQuantity ? Number(formValues.foldingWorkQuantity) : undefined,
      foldingGoodQuantity: formValues.foldingGoodQuantity ? Number(formValues.foldingGoodQuantity) : undefined,
      foldingDefectQuantity: formValues.foldingDefectQuantity ? Number(formValues.foldingDefectQuantity) : undefined,
      foldingDiscardQuantity: formValues.foldingDiscardQuantity ? Number(formValues.foldingDiscardQuantity) : undefined,
      foldingDefectRate: formValues.foldingDefectRate ? Number(formValues.foldingDefectRate) : undefined,

      // B. 생산 정보 - 탑컷팅
      topCuttingWorkQuantity: formValues.topCuttingWorkQuantity ? Number(formValues.topCuttingWorkQuantity) : undefined,
      topCuttingGoodQuantity: formValues.topCuttingGoodQuantity ? Number(formValues.topCuttingGoodQuantity) : undefined,
      topCuttingDefectQuantity: formValues.topCuttingDefectQuantity ? Number(formValues.topCuttingDefectQuantity) : undefined,
      topCuttingDiscardQuantity: formValues.topCuttingDiscardQuantity ? Number(formValues.topCuttingDiscardQuantity) : undefined,
      topCuttingDefectRate: formValues.topCuttingDefectRate ? Number(formValues.topCuttingDefectRate) : undefined,

      // C. 공정 조건 - 컷팅
      cuttingLength: formValues.cuttingLength ? Number(formValues.cuttingLength) : undefined,
      cuttingChecklist: formValues.cuttingChecklist,

      // C. 공정 조건 - 포밍
      formingDepth: formValues.formingDepth ? Number(formValues.formingDepth) : undefined,
      formingStopperHeight: formValues.formingStopperHeight ? Number(formValues.formingStopperHeight) : undefined,
      formingChecklist: formValues.formingChecklist,

      // C. 공정 조건 - 탑컷팅
      topCuttingLength: formValues.topCuttingLength ? Number(formValues.topCuttingLength) : undefined,
      topCuttingChecklist: formValues.topCuttingChecklist,
    };

    setSubmitting(true);
    try {
      await updateFormingWorklog(Number(projectId), Number(worklogId), payload);
      alert('Forming 작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Forming`);
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
  const pouchLotOptions = pouchLots.map(p => p.lot);
  const formingSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    ...(pouchLotOptions.length > 0 && { pouchLot: pouchLotOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Forming 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
          <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/project/log/${projectId}?category=Assembly&process=Forming`)}>
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
        numericFields={FORMING_NUMERIC_FIELDS}
        integerFields={FORMING_INTEGER_FIELDS}
        readOnlyFields={[...COMMON_READONLY_FIELDS, ...POUCH_AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
        selectFields={formingSelectFields}
        dateFields={['manufactureDate']}
        tooltips={fieldTooltips}
        formulaRefs={formulaRefs}
      />
    </div>
  );
}
