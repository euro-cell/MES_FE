import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useSeparatorLots } from '../../shared/useSeparatorLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getStackingWorklog, updateStackingWorklog } from '../../../../../api/project/worklog';
import type { StackingWorklog, StackingWorklogPayload } from './StackingTypes';
import { STACKING_NUMERIC_FIELDS, STACKING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (분리막 LOT 선택 시 제조사, 스팩 자동 입력)
const SEPARATOR_AUTO_FILL_FIELDS = ['separatorManufacturer', 'separatorSpec'];
// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (투입량 - 불량 수량)
  'stackGoodQuantity',
  'hipot1GoodQuantity',
  // 불량률 (불량 수량 / 투입량 * 100)
  'stackDefectRate',
  'hipot1DefectRate',
];

export default function StackingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('stacking');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklogData, setWorklogData] = useState<StackingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { separatorLots } = useSeparatorLots();

  // 자동계산 필드 툴팁
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    const processes = [
      { key: 'stack', label: '스태킹' },
      { key: 'hipot1', label: 'Hipot1' },
    ];
    for (const { key, label } of processes) {
      tips[`${key}GoodQuantity`] = `= ${label} 투입량 - ${label} 불량 수량`;
      tips[`${key}DefectRate`] = `= (${label} 불량 수량 / ${label} 투입량) × 100`;
    }
    return tips;
  }, []);

  // 자동계산 필드 참조 (하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = { blue: '#2196F3', green: '#4CAF50' };
    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    const processes = [
      { key: 'stack', label: '스태킹' },
      { key: 'hipot1', label: 'Hipot1' },
    ];
    for (const { key, label } of processes) {
      refs[`${key}GoodQuantity`] = {
        formula: `= ${label} 투입량 - ${label} 불량 수량`,
        refs: [
          { field: `${key}ActualInput`, label: `${label} 투입량`, color: COLORS.blue },
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.green },
        ],
      };
      refs[`${key}DefectRate`] = {
        formula: `= (${label} 불량 수량 / ${label} 투입량) × 100`,
        refs: [
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.blue },
          { field: `${key}ActualInput`, label: `${label} 투입량`, color: COLORS.green },
        ],
      };
    }
    return refs;
  }, []);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getStackingWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        // StackingWorklog 데이터를 Named Range에 맞춰 formValues로 변환
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
  }, [projectId, worklogId, namedRanges]);

  // 양품 수량 및 불량률 자동계산 헬퍼 함수
  const calculateAutoFields = (
    prev: Record<string, any>,
    rangeName: string,
    value: any
  ): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['stack', 'hipot1'];
    for (const process of processes) {
      const inputField = `${process}ActualInput`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === inputField || rangeName === defectField) {
        const inputQty = rangeName === inputField ? (value || 0) : (prev[inputField] || 0);
        const defectQty = rangeName === defectField ? (value || 0) : (prev[defectField] || 0);
        // 양품 수량 = 투입량 - 불량 수량
        updates[goodField] = Math.max(0, Number(inputQty) - Number(defectQty));
        // 불량률 = (불량 수량 / 투입량) * 100
        updates[defectRateField] = Number(inputQty) > 0
          ? Math.round((Number(defectQty) / Number(inputQty)) * 10000) / 100
          : 0;
      }
    }

    return updates;
  };

  // 분리막 LOT 선택 시 제조사, 스팩 자동 입력 + 양품 수량 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'separatorLot') {
      const firstLot = typeof value === 'string' ? value.split(',')[0].trim() : value;
      const selectedSeparator = separatorLots.find(s => s.lot === firstLot);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        separatorManufacturer: selectedSeparator?.manufacturer || '',
        separatorSpec: selectedSeparator?.spec || '',
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        ...calculateAutoFields(prev, rangeName, value),
      }));
    }
  };

  const handleSave = async () => {
    if (!projectId || !worklogId) return;

    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, STACKING_NUMERIC_FIELDS) as Partial<StackingWorklogPayload>;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateStackingWorklog(Number(projectId), Number(worklogId), payload);
      alert('작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Stacking`);
    } catch (err) {
      alert('수정 실패: ' + err);
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('수정한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Stacking`);
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

  // 드롭다운 옵션 생성
  const plantOptions = plantEquipments.map(eq => eq.name);
  const separatorLotOptions = separatorLots.map(s => s.lot);
  const stackingSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };
  const stackingMultiSelectFields: Record<string, string[]> = {
    ...(separatorLotOptions.length > 0 && { separatorLot: separatorLotOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Stacking 작업일지 수정</h2>
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
          timeFields={['jr1WorkTime', 'jr2WorkTime', 'jr3WorkTime', 'jr4WorkTime']}
          numericFields={STACKING_NUMERIC_FIELDS}
          integerFields={STACKING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...SEPARATOR_AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={stackingSelectFields}
          multiSelectFields={stackingMultiSelectFields}
          dateFields={['manufactureDate']}
          tooltips={fieldTooltips}
          formulaRefs={formulaRefs}
        />
      </div>
    </div>
  );
}
