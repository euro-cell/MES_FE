import { useState, useEffect } from 'react';
import { getSpecificationByProject } from '../../../../api/project/spec';
import type { SpecForm } from '../../spec/specification/SpecTypes';

export function useProjectSpecification(projectId?: string) {
  const [specification, setSpecification] = useState<SpecForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setNotFound(false);
    getSpecificationByProject(Number(projectId))
      .then(data => setSpecification(data))
      .catch(err => {
        console.error('설계정보 조회 실패:', err);
        setSpecification(null);
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  return { specification, loading, notFound };
}
