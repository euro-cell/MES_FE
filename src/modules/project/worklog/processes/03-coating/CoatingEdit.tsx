import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useFoilLots } from '../../shared/useFoilLots';
import { useSlurryLots } from '../../shared/useSlurryLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getCoatingWorklog, updateCoatingWorklog } from '../../../../../api/project/worklog';
import type { CoatingWorklog, CoatingWorklogPayload } from './CoatingTypes';
import { COATING_NUMERIC_FIELDS, COATING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
const FOIL_TYPE_OPTIONS = ['Al Foil', 'Cu Foil'];
// 자동입력 필드 (LOT 선택 시 자동으로 채워지는 필드)
const COATING_AUTO_FILL_FIELDS = ['manufacturer', 'spec', 'solidContent', 'viscosity'];

export default function CoatingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('coating');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklogData, setWorklogData] = useState<CoatingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);

  // 호일 LOT 조회 (materialType 선택에 따라)
  const { lotOptions: foilLotOptions, getLotInfo: getFoilLotInfo } = useFoilLots(formValues.materialType);
  // 슬러리 LOT 조회 (프로젝트 ID 기반)
  const { lotOptions: slurryLotOptions, getLotInfo: getSlurryLotInfo } = useSlurryLots(projectId);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getCoatingWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

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
  }, [projectId, worklogId, namedRanges, project]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => {
      const newValues = { ...prev, [rangeName]: value };

      // materialType 변경 시 LOT, 제조사, 스펙 초기화
      if (rangeName === 'materialType') {
        newValues.materialLot = '';
        newValues.manufacturer = '';
        newValues.spec = '';
      }

      // 호일 LOT 선택 시 제조사, 스펙 자동입력 (첫 번째 선택 lot 기준)
      if (rangeName === 'materialLot' && value) {
        const firstLot = typeof value === 'string' ? value.split(',')[0].trim() : value;
        const foilInfo = getFoilLotInfo(firstLot);
        if (foilInfo) {
          newValues.manufacturer = foilInfo.manufacturer;
          newValues.spec = foilInfo.spec;
        }
      }

      // 슬러리 LOT 선택 시 고형분, 점도 자동입력 (첫 번째 선택 lot 기준)
      if (rangeName === 'materialLot2' && value) {
        const firstLot2 = typeof value === 'string' ? value.split(',')[0].trim() : value;
        const slurryInfo = getSlurryLotInfo(firstLot2);
        if (slurryInfo) {
          newValues.solidContent = slurryInfo.solidContent;
          newValues.viscosity = String(slurryInfo.viscosity);
        }
      }

      return newValues;
    });
  };

  const handleSave = async () => {
    if (!projectId || !worklogId) return;

    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, COATING_NUMERIC_FIELDS) as Partial<CoatingWorklogPayload>;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateCoatingWorklog(Number(projectId), Number(worklogId), payload);
      alert('작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Coating`);
    } catch (err) {
      alert('수정 실패: ' + err);
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('수정한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Electrode&process=Coating`);
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

  const plantOptions = plantEquipments.map(eq => eq.name);
  const coatingSideOptions = ['단면', '양면'];
  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    materialType: FOIL_TYPE_OPTIONS,
    materialType2: ['Slurry'],
    coatingSide1: coatingSideOptions,
    coatingSide2: coatingSideOptions,
    coatingSide3: coatingSideOptions,
    coatingSide4: coatingSideOptions,
  };
  const multiSelectFields: Record<string, string[]> = {
    ...(foilLotOptions.length > 0 && { materialLot: foilLotOptions }),
    ...(slurryLotOptions.length > 0 && { materialLot2: slurryLotOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Coating 작업일지 수정</h2>
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
          editableRanges={Object.keys(namedRanges).filter(name => ![...COMMON_READONLY_FIELDS, ...COATING_AUTO_FILL_FIELDS].includes(name))}
          cellValues={formValues}
          namedRanges={namedRanges}
          onCellChange={handleCellChange}
          multilineFields={[]}
          timeFields={[]}
          numericFields={COATING_NUMERIC_FIELDS}
          integerFields={COATING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...COATING_AUTO_FILL_FIELDS]}
          selectFields={selectFields}
          multiSelectFields={multiSelectFields}
          dateFields={['manufactureDate']}
        />
      </div>
    </div>
  );
}
