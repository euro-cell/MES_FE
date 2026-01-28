import { useState, useEffect } from 'react';
import { getMaterialCategories } from '../../../../api/material';

/**
 * 자재 카테고리 목록을 로드하는 커스텀 훅
 * GET /material/categories API를 호출하여 카테고리 목록을 반환
 */
export function useMaterialCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getMaterialCategories();
        setCategories(data);
      } catch (err) {
        console.error('자재 카테고리 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('자재 카테고리 조회 실패'));
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, loading, error };
}
