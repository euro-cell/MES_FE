import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { createVdWorklog } from './VdService';
import type { VdWorklogPayload } from './VdTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import { getLineEquipments } from '../../../../plant/register/EquipmentService';
import type { Equipment } from '../../../../plant/register/EquipmentTypes';
import { LABEL_CATEGORY_MAP, type CategoryLabel } from '../../shared/processCategories';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';

// 라인명 고정 옵션
const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

export default function VdRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading, error } = useExcelTemplate('Vd');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [namedRanges, setNamedRanges] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<WorklogProject | null>(null);
  const [plantEquipments, setPlantEquipments] = useState<Equipment[]>([]);

  // 프로젝트 정보 로드
  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        const proj = await getProject(Number(projectId));
        setProject(proj);
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

  // Named Ranges 추출
  useEffect(() => {
    if (workbook) {
      const ranges = extractNamedRanges(workbook);
      setNamedRanges(ranges);
    }
  }, [workbook]);

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
    setFormValues(prev => ({
      ...prev,
      [rangeName]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    const payload: VdWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,
      manufactureDate: formValues.manufactureDate || '',
      worker: formValues.worker || '',
      line: formValues.line || '',
      plant: formValues.plant ? (plantEquipments.find(eq => eq.name === formValues.plant)?.id ?? null) : null,
      shift: formValues.shift || '',

      // A. 자재 투입 정보 - 양극 매거진
      cathodeMagazineLot1: formValues.cathodeMagazineLot1,
      cathodeMagazineLot2: formValues.cathodeMagazineLot2,
      cathodeMagazineLot3: formValues.cathodeMagazineLot3,
      cathodeMagazineLot4: formValues.cathodeMagazineLot4,
      cathodeMagazineLot5: formValues.cathodeMagazineLot5,

      // A. 자재 투입 정보 - 음극 매거진
      anodeMagazineLot1: formValues.anodeMagazineLot1,
      anodeMagazineLot2: formValues.anodeMagazineLot2,
      anodeMagazineLot3: formValues.anodeMagazineLot3,
      anodeMagazineLot4: formValues.anodeMagazineLot4,
      anodeMagazineLot5: formValues.anodeMagazineLot5,

      // B. 생산 정보 - 1차 상단
      upperLot1: formValues.upperLot1,
      upperInputQuantity1: formValues.upperInputQuantity1 ? Number(formValues.upperInputQuantity1) : undefined,
      upperInputOutputTime1: formValues.upperInputOutputTime1,
      upperMoistureMeasurement1: formValues.upperMoistureMeasurement1
        ? Number(formValues.upperMoistureMeasurement1)
        : undefined,

      // B. 생산 정보 - 1차 하단
      lowerLot1: formValues.lowerLot1,
      lowerInputQuantity1: formValues.lowerInputQuantity1 ? Number(formValues.lowerInputQuantity1) : undefined,
      lowerInputOutputTime1: formValues.lowerInputOutputTime1,
      lowerMoistureMeasurement1: formValues.lowerMoistureMeasurement1
        ? Number(formValues.lowerMoistureMeasurement1)
        : undefined,

      // B. 생산 정보 - 2차 상단
      upperLot2: formValues.upperLot2,
      upperInputQuantity2: formValues.upperInputQuantity2 ? Number(formValues.upperInputQuantity2) : undefined,
      upperInputOutputTime2: formValues.upperInputOutputTime2,
      upperMoistureMeasurement2: formValues.upperMoistureMeasurement2
        ? Number(formValues.upperMoistureMeasurement2)
        : undefined,

      // B. 생산 정보 - 2차 하단
      lowerLot2: formValues.lowerLot2,
      lowerInputQuantity2: formValues.lowerInputQuantity2 ? Number(formValues.lowerInputQuantity2) : undefined,
      lowerInputOutputTime2: formValues.lowerInputOutputTime2,
      lowerMoistureMeasurement2: formValues.lowerMoistureMeasurement2
        ? Number(formValues.lowerMoistureMeasurement2)
        : undefined,

      // B. 생산 정보 - 3차 상단
      upperLot3: formValues.upperLot3,
      upperInputQuantity3: formValues.upperInputQuantity3 ? Number(formValues.upperInputQuantity3) : undefined,
      upperInputOutputTime3: formValues.upperInputOutputTime3,
      upperMoistureMeasurement3: formValues.upperMoistureMeasurement3
        ? Number(formValues.upperMoistureMeasurement3)
        : undefined,

      // B. 생산 정보 - 3차 하단
      lowerLot3: formValues.lowerLot3,
      lowerInputQuantity3: formValues.lowerInputQuantity3 ? Number(formValues.lowerInputQuantity3) : undefined,
      lowerInputOutputTime3: formValues.lowerInputOutputTime3,
      lowerMoistureMeasurement3: formValues.lowerMoistureMeasurement3
        ? Number(formValues.lowerMoistureMeasurement3)
        : undefined,

      // B. 생산 정보 - 4차 상단
      upperLot4: formValues.upperLot4,
      upperInputQuantity4: formValues.upperInputQuantity4 ? Number(formValues.upperInputQuantity4) : undefined,
      upperInputOutputTime4: formValues.upperInputOutputTime4,
      upperMoistureMeasurement4: formValues.upperMoistureMeasurement4
        ? Number(formValues.upperMoistureMeasurement4)
        : undefined,

      // B. 생산 정보 - 4차 하단
      lowerLot4: formValues.lowerLot4,
      lowerInputQuantity4: formValues.lowerInputQuantity4 ? Number(formValues.lowerInputQuantity4) : undefined,
      lowerInputOutputTime4: formValues.lowerInputOutputTime4,
      lowerMoistureMeasurement4: formValues.lowerMoistureMeasurement4
        ? Number(formValues.lowerMoistureMeasurement4)
        : undefined,

      // B. 생산 정보 - 5차 상단
      upperLot5: formValues.upperLot5,
      upperInputQuantity5: formValues.upperInputQuantity5 ? Number(formValues.upperInputQuantity5) : undefined,
      upperInputOutputTime5: formValues.upperInputOutputTime5,
      upperMoistureMeasurement5: formValues.upperMoistureMeasurement5
        ? Number(formValues.upperMoistureMeasurement5)
        : undefined,

      // B. 생산 정보 - 5차 하단
      lowerLot5: formValues.lowerLot5,
      lowerInputQuantity5: formValues.lowerInputQuantity5 ? Number(formValues.lowerInputQuantity5) : undefined,
      lowerInputOutputTime5: formValues.lowerInputOutputTime5,
      lowerMoistureMeasurement5: formValues.lowerMoistureMeasurement5
        ? Number(formValues.lowerMoistureMeasurement5)
        : undefined,

      // C. 공정 조건
      vacuumDegreeSetting: formValues.vacuumDegreeSetting ? Number(formValues.vacuumDegreeSetting) : undefined,
      upperSetTemperature: formValues.upperSetTemperature ? Number(formValues.upperSetTemperature) : undefined,
      lowerSetTemperature: formValues.lowerSetTemperature ? Number(formValues.lowerSetTemperature) : undefined,
      upperTimerTime: formValues.upperTimerTime ? Number(formValues.upperTimerTime) : undefined,
      lowerTimerTime: formValues.lowerTimerTime ? Number(formValues.lowerTimerTime) : undefined,
    };

    setSubmitting(true);
    try {
      await createVdWorklog(Number(projectId), payload);
      alert('VD 작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=VD`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>템플릿을 불러오는 중...</p>;
  if (error) return <p>템플릿 로드 실패: {error.message}</p>;
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
          <h2>VD 작업일지 등록</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnCancel}
            onClick={() => navigate(`/project/log/${projectId}?category=Assembly&process=VD`)}
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
        readOnlyFields={COMMON_READONLY_FIELDS}
        selectFields={selectFields}
        dateFields={['manufactureDate']}
      />
    </div>
  );
}
