import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createSlurryWorklog } from './SlurryService';
import type { SlurryWorklogPayload } from './SlurryTypes';
import { SLURRY_TIME_FIELDS, SLURRY_MULTILINE_FIELDS } from './slurryConstants';
import styles from '../../../../../../styles/production/worklog/SlurryRegister.module.css';

export default function SlurryRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('slurry');
  const { namedRanges } = useNamedRanges(workbook);

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Object.keys(namedRanges).length > 0) {
      const initialValues: Record<string, any> = {};
      Object.keys(namedRanges).forEach(rangeName => {
        initialValues[rangeName] = '';
      });
      setFormValues(initialValues);
    }
  }, [namedRanges]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [rangeName]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges) as SlurryWorklogPayload;
      await createSlurryWorklog(Number(projectId), payload);
      alert('작업일지가 등록되었습니다.');
      navigate(`/prod/log/${projectId}?category=Electrode&process=Slurry`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/prod/log/${projectId}?category=Electrode&process=Slurry`);
    }
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Slurry Mixing 작업일지 등록</h2>
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
          editableRanges={Object.keys(namedRanges)}
          cellValues={formValues}
          namedRanges={namedRanges}
          onCellChange={handleCellChange}
          multilineFields={SLURRY_MULTILINE_FIELDS}
          timeFields={SLURRY_TIME_FIELDS}
        />
      </div>

      <div className={styles.footer}>
        <p className={styles.hint}>파란색으로 표시된 셀에 값을 입력할 수 있습니다.</p>
      </div>
    </div>
  );
}
