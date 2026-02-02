import { useState, useEffect } from 'react';
import { getSpecificationByProject } from '../../../../api/project/spec';
import type { SpecForm } from '../../spec/specification/SpecTypes';

export function useProjectSpecification(projectId?: string) {
  const [specification, setSpecification] = useState<SpecForm | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    getSpecificationByProject(Number(projectId))
      .then(setSpecification)
      .catch(err => console.error('설계정보 조회 실패:', err))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { specification, loading };
}
