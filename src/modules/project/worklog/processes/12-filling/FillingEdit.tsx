import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useElectrolyteLots } from '../../shared/useElectrolyteLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getFillingWorklog, updateFillingWorklog } from '../../../../../api/project/worklog';
import type { FillingWorklog, FillingWorklogPayload } from './FillingTypes';
import { FILLING_NUMERIC_FIELDS, FILLING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 전해액 사용량 기본값 (자동계산 전 안내 문구)
const ELECTROLYTE_USAGE_PLACEHOLDER = 'Wetting 작업 수량 * 주액량(spec), kg 단위 변환';
// 자동입력 필드 (전해액 LOT 선택 시 제조사, 스팩 자동 입력)
const AUTO_FILL_FIELDS = ['electrolyteManufacturer', 'electrolyteSpec'];
// 자동계산 필드 (양품 수량, 불량률, 전해액 사용량)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (작업 수량 - 불량 수량 - 폐기 수량)
  'fillingGoodQuantity',
  'waitingGoodQuantity',
  // 불량률 (불량 수량 / 작업 수량 * 100)
  'fillingDefectRate',
  'waitingDefectRate',
  // 전해액 사용량 (주액량 스팩 * 웨이팅 작업 수량 / 1000)
  'electrolyteUsage',
];

export default function FillingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('filling');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklogData, setWorklogData] = useState<FillingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { electrolyteLots } = useElectrolyteLots();

  // 자동계산 필드 툴팁
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    const processes = [
      { key: 'filling', label: '주액' },
      { key: 'waiting', label: 'Wetting' },
    ];
    for (const { key, label } of processes) {
      tips[`${key}GoodQuantity`] = `= ${label} 작업 수량 - ${label} 불량 수량`;
      tips[`${key}DefectRate`] = `= (${label} 불량 수량 / ${label} 작업 수량) × 100`;
    }
    tips['electrolyteUsage'] = '= 주액량(Spec) × Wetting 작업 수량 / 1000 (kg 변환)';
    return tips;
  }, []);

  // 자동계산 필드 참조 (하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = { blue: '#2196F3', green: '#4CAF50', orange: '#FF9800' };
    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    const processes = [
      { key: 'filling', label: '주액' },
      { key: 'waiting', label: 'Wetting' },
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
    refs['electrolyteUsage'] = {
      formula: '= 주액량(Spec) × Wetting 작업 수량 / 1000',
      refs: [
        { field: 'fillingSpecInjectionAmount', label: '주액량(Spec)', color: COLORS.blue },
        { field: 'waitingWorkQuantity', label: 'Wetting 작업 수량', color: COLORS.green },
      ],
    };
    return refs;
  }, []);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getFillingWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        // FillingWorklog 데이터를 Named Range에 맞춰 formValues로 변환
        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          if (rangeName === 'productionId' && project) {
            values[rangeName] = project.name;
          } else if (rangeName === 'electrolyteUsage' && !(data as any)[rangeName]) {
            // 전해액 사용량이 없으면 안내 문구 표시
            values[rangeName] = ELECTROLYTE_USAGE_PLACEHOLDER;
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

  // 양품 수량, 불량률, 전해액 사용량 자동계산 헬퍼 함수
  const calculateAutoFields = (
    prev: Record<string, any>,
    rangeName: string,
    value: any
  ): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['filling', 'waiting'];
    for (const process of processes) {
      const workField = `${process}WorkQuantity`;
      const defectField = `${process}DefectQuantity`;
      const discardField = `${process}DiscardQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === workField || rangeName === defectField || rangeName === discardField) {
        const workQty = rangeName === workField ? (value || 0) : (prev[workField] || 0);
        const defectQty = rangeName === defectField ? (value || 0) : (prev[defectField] || 0);
        const discardQty = rangeName === discardField ? (value || 0) : (prev[discardField] || 0);
        // 양품 수량 = 작업 수량 - 불량 수량 - 폐기 수량
        updates[goodField] = Math.max(0, Number(workQty) - Number(defectQty) - Number(discardQty));
        // 불량률 = (불량 수량 / 작업 수량) * 100
        updates[defectRateField] = Number(workQty) > 0
          ? Math.round((Number(defectQty) / Number(workQty)) * 10000) / 100
          : 0;
      }
    }

    // 전해액 사용량 계산 (주액량 스팩 * 웨이팅 작업 수량 / 1000 -> g을 kg으로 변환)
    if (rangeName === 'fillingSpecInjectionAmount' || rangeName === 'waitingWorkQuantity') {
      const specAmount = rangeName === 'fillingSpecInjectionAmount' ? (value || 0) : (prev['fillingSpecInjectionAmount'] || 0);
      const waitingQty = rangeName === 'waitingWorkQuantity' ? (value || 0) : (prev['waitingWorkQuantity'] || 0);
      // 전해액 사용량 = 주액량 스팩(g) * 웨이팅 작업 수량 / 1000 (kg 변환)
      updates['electrolyteUsage'] = Math.round((Number(specAmount) * Number(waitingQty) / 1000) * 100) / 100;
    }

    return updates;
  };

  // 전해액 LOT 선택 시 제조사, 스팩 자동 입력 + 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'electrolyteLot') {
      const firstLot = typeof value === 'string' ? value.split(',')[0].trim() : value;
      const selectedElectrolyte = electrolyteLots.find(e => e.lot === firstLot);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        electrolyteManufacturer: selectedElectrolyte?.manufacturer || '',
        electrolyteSpec: selectedElectrolyte?.spec || '',
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
      const payload = mapFormToPayload(formValues, namedRanges, FILLING_NUMERIC_FIELDS) as Partial<FillingWorklogPayload>;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateFillingWorklog(Number(projectId), Number(worklogId), payload);
      alert('작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Filling`);
    } catch (err) {
      alert('수정 실패: ' + err);
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('수정한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Filling`);
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
  const electrolyteLotOptions = electrolyteLots.map(e => e.lot);
  const fillingSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };
  const fillingMultiSelectFields: Record<string, string[]> = {
    electrolyteLot: electrolyteLotOptions,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Filling 작업일지 수정</h2>
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
          numericFields={FILLING_NUMERIC_FIELDS}
          integerFields={FILLING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={fillingSelectFields}
          multiSelectFields={fillingMultiSelectFields}
          dateFields={['manufactureDate']}
          tooltips={fieldTooltips}
          formulaRefs={formulaRefs}
        />
      </div>
    </div>
  );
}
