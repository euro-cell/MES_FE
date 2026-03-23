import { useState, useEffect, useCallback } from 'react';
import type { WorklogProject } from '../WorklogTypes';
import { useAuth } from '../../../../hooks/useAuth';

interface NamedRange {
  value?: any;
  [key: string]: any;
}

interface UseWorklogFormInitOptions {
  namedRanges: Record<string, NamedRange>;
  project: WorklogProject | null;
  /** 기존 데이터 (Edit 모드에서 사용) */
  existingData?: Record<string, any> | null;
}

/**
 * 작업일지 폼 초기화 및 상태 관리를 위한 커스텀 훅
 * Register와 Edit 컴포넌트에서 공통으로 사용
 */
export function useWorklogFormInit({
  namedRanges,
  project,
  existingData,
}: UseWorklogFormInitOptions) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const { user } = useAuth();

  // Register 모드: namedRanges와 project 기반 초기화
  useEffect(() => {
    if (existingData) return; // Edit 모드는 별도 처리
    if (Object.keys(namedRanges).length === 0) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const initialValues: Record<string, any> = {};

    Object.keys(namedRanges).forEach(rangeName => {
      if (rangeName === 'projectId' && project) {
        initialValues[rangeName] = project.name;
      } else if (rangeName === 'manufactureDate') {
        initialValues[rangeName] = today;
      } else if (rangeName === 'writer' && user) {
        initialValues[rangeName] = user.name;
      } else {
        const defaultValue = namedRanges[rangeName]?.value;
        initialValues[rangeName] = defaultValue ?? '';
      }
    });

    setFormValues(initialValues);
  }, [namedRanges, project, existingData, user]);

  // Edit 모드: existingData 기반 초기화
  useEffect(() => {
    if (!existingData) return;
    if (Object.keys(namedRanges).length === 0) return;

    const values: Record<string, any> = {};
    Object.keys(namedRanges).forEach(rangeName => {
      if (rangeName === 'projectId' && project) {
        values[rangeName] = project.name;
      } else {
        values[rangeName] = (existingData as any)[rangeName] ?? '';
      }
    });
    setFormValues(values);
  }, [namedRanges, project, existingData]);

  const handleCellChange = useCallback((rangeName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [rangeName]: value,
    }));
  }, []);

  return {
    formValues,
    setFormValues,
    handleCellChange,
  };
}
