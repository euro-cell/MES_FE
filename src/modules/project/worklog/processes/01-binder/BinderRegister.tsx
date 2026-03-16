import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useMaterialCategories } from '../../shared/useMaterialCategories';
import { useMaterialLots } from '../../shared/useMaterialLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import MixingInfoModal from '../../shared/MixingInfoModal';
import { mapFormToPayload } from '../../shared/excelUtils';
import { BINDER_NUMERIC_FIELDS, BINDER_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import {
  saveWorklogDefaults,
  loadWorklogDefaults,
  saveWorklogAllFields,
  loadWorklogAllFields,
} from '../../shared/worklogDefaults';
import { createBinderWorklog, type SlurryMixingInfo } from '../../../../../api/project/worklog';
import type { BinderWorklogPayload } from './BinderTypes';
import { getMixerEquipments } from '../../../../../api/plant/EquipmentService';
import type { Equipment } from '../../../../plant/register/EquipmentTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';
import toast from 'react-hot-toast';

// 라인명 고정 옵션
const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

export default function BinderRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('binder');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues, handleCellChange } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);

  // LocalStorage에서 기본값 불러오기
  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;
    const defaults = loadWorklogDefaults('binder');
    if (defaults) {
      setFormValues(prev => ({ ...prev, ...defaults }));
    }
  }, [Object.keys(formValues).length > 0]);
  const { categories: materialCategories } = useMaterialCategories();
  const { lotOptions: material1LotOptions } = useMaterialLots(formValues.material1Name);
  const { lotOptions: material2LotOptions } = useMaterialLots(formValues.material2Name);

  const [saving, setSaving] = useState(false);
  const [mixerEquipments, setMixerEquipments] = useState<Equipment[]>([]);
  const [showMixingInfoModal, setShowMixingInfoModal] = useState(false);

  // Mixer 설비 목록 로드
  useEffect(() => {
    const loadMixers = async () => {
      try {
        const mixers = await getMixerEquipments();
        setMixerEquipments(mixers);
      } catch (err) {
        console.error('Mixer 설비 조회 실패:', err);
      }
    };
    loadMixers();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, BINDER_NUMERIC_FIELDS) as BinderWorklogPayload;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createBinderWorklog(Number(projectId), payload);
      // 저장 성공 시 기본값 저장
      saveWorklogDefaults('binder', formValues);
      saveWorklogAllFields('binder', formValues);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Binder`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Electrode&process=Binder`);
    }
  };

  // 이전 내용 불러오기
  const handleLoadPrevious = () => {
    const savedFields = loadWorklogAllFields('binder');
    if (savedFields) {
      setFormValues(prev => ({ ...prev, ...savedFields }));
      toast.success('이전 등록 내용을 불러왔습니다.');
    } else {
      toast.error('저장된 이전 내용이 없습니다.');
    }
  };

  // 믹싱 정보 선택 시 투입량설계 자동 계산
  const handleMixingInfoSelect = (mixingInfo: SlurryMixingInfo) => {
    const binderPlannedInput = mixingInfo.binderPlannedInput;
    if (!binderPlannedInput) {
      toast.error('바인더 투입량설계 정보가 없습니다.');
      setShowMixingInfoModal(false);
      return;
    }

    // 현재 formValues에서 조성(%) 값 가져오기
    const material1Comp = parseFloat(formValues.material1Composition) || 0;
    const material2Comp = parseFloat(formValues.material2Composition) || 0;

    // 투입량설계 계산: binderPlannedInput * 조성(%) / 100
    const newValues: Record<string, any> = {};
    if (material1Comp > 0) {
      newValues.material1PlannedInput = Number((binderPlannedInput * material1Comp / 100).toFixed(3));
    }
    if (material2Comp > 0) {
      newValues.material2PlannedInput = Number((binderPlannedInput * material2Comp / 100).toFixed(3));
    }

    setFormValues(prev => ({ ...prev, ...newValues }));
    setShowMixingInfoModal(false);
    toast.success(`${mixingInfo.lot} 믹싱 정보가 적용되었습니다.`);
  };

  if (templateLoading) {
    return (
      <div className={styles.container}>
        <p>엑셀 템플릿을 불러오는 중...</p>
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

  if (!workbook) {
    return (
      <div className={styles.container}>
        <p>엑셀 템플릿을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 드롭다운 옵션 생성
  const mixerOptions = mixerEquipments.map(eq => eq.name);
  const plantOptions = plantEquipments.map(eq => eq.name);

  const binderSelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(mixerOptions.length > 0 && { pdMixerName: mixerOptions }),
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    // 자재투입정보 구분 드롭다운
    ...(materialCategories.length > 0 && {
      material1Name: materialCategories,
      material2Name: materialCategories,
    }),
  };

  const binderMultiSelectFields: Record<string, string[]> = {
    // 자재투입정보 LOT 다중선택
    ...(material1LotOptions.length > 0 && { material1Lot: material1LotOptions }),
    ...(material2LotOptions.length > 0 && { material2Lot: material2LotOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h2>Binder 작업일지 등록</h2>
            {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
            <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
          </div>
          <button
            onClick={handleLoadPrevious}
            className={styles.loadPreviousButton}
            disabled={saving}
            title='마지막으로 저장한 작업일지 내용을 불러옵니다 (프로젝트명, 날짜, 작성자 제외)'
          >
            이전 내용 불러오기
          </button>
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
          timeFields={[
            'nmpWeightStartTime',
            'nmpWeightEndTime',
            'binderWeightStartTime',
            'binderWeightEndTime',
            'mixing1StartTime',
            'mixing1EndTime',
            'scrappingStartTime',
            'scrappingEndTime',
            'mixing2StartTime',
            'mixing2EndTime',
            'stabilizationStartTime',
            'stabilizationEndTime',
          ]}
          numericFields={BINDER_NUMERIC_FIELDS}
          integerFields={BINDER_INTEGER_FIELDS}
          readOnlyFields={COMMON_READONLY_FIELDS}
          selectFields={binderSelectFields}
          multiSelectFields={binderMultiSelectFields}
          dateFields={['manufactureDate']}
          headerButton={
            <button
              onClick={() => setShowMixingInfoModal(true)}
              className={styles.mixingInfoButton}
              disabled={saving}
              title='Slurry 작업일지의 믹싱 정보를 불러와 투입량설계를 자동 계산합니다'
            >
              믹싱 정보 불러오기
            </button>
          }
        />
      </div>

      {showMixingInfoModal && projectId && (
        <MixingInfoModal
          projectId={projectId}
          onClose={() => setShowMixingInfoModal(false)}
          onSelect={handleMixingInfoSelect}
        />
      )}
    </div>
  );
}
