import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { usePouchLots } from '../../shared/usePouchLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getSealingWorklog, updateSealingWorklog } from '../../../../../api/project/worklog';
import type { SealingWorklog, SealingWorklogPayload } from './SealingTypes';
import { SEALING_NUMERIC_FIELDS, SEALING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (파우치 LOT 선택 시 제조사 자동 입력)
const AUTO_FILL_FIELDS = ['pouchManufacturer'];
// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (작업 수량 - 불량 수량 - 폐기 수량)
  'topGoodQuantity',
  'sideGoodQuantity',
  'hipot3GoodQuantity',
  // 불량률 (불량 수량 / 작업 수량 * 100)
  'topDefectRate',
  'sideDefectRate',
  'hipot3DefectRate',
];

export default function SealingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('sealing');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklogData, setWorklogData] = useState<SealingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { pouchLots } = usePouchLots();

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getSealingWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        // SealingWorklog 데이터를 Named Range에 맞춰 formValues로 변환
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
    const processes = ['top', 'side', 'hipot3'];
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

    return updates;
  };

  // 파우치 LOT 선택 시 제조사 자동 입력 + 양품 수량 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'pouchLot') {
      const selectedPouch = pouchLots.find(p => p.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        pouchManufacturer: selectedPouch?.manufacturer || '',
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
      const payload = mapFormToPayload(formValues, namedRanges, SEALING_NUMERIC_FIELDS) as Partial<SealingWorklogPayload>;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateSealingWorklog(Number(projectId), Number(worklogId), payload);
      alert('작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Sealing`);
    } catch (err) {
      alert('수정 실패: ' + err);
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('수정한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Sealing`);
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
  const pouchLotOptions = pouchLots.map(p => p.lot);
  const sealingSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    // 파우치 LOT 선택박스
    pouchLot: pouchLotOptions,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Sealing 작업일지 수정</h2>
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
          multilineFields={['topChecklist', 'sideChecklist', 'bottomChecklist', 'remarkTop', 'remarkSide']}
          numericFields={SEALING_NUMERIC_FIELDS}
          integerFields={SEALING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={sealingSelectFields}
          dateFields={['manufactureDate']}
        />
      </div>
    </div>
  );
}
