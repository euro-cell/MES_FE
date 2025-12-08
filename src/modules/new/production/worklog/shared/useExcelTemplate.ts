import { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface UseExcelTemplateReturn {
  workbook: ExcelJS.Workbook | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useExcelTemplate(processId: string): UseExcelTemplateReturn {
  const [workbook, setWorkbook] = useState<ExcelJS.Workbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTemplate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/worklog/${processId.toLowerCase()}`, {
        responseType: 'arraybuffer',
        withCredentials: true,
      });

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(response.data);
      setWorkbook(wb);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('엑셀 템플릿 로드 실패');
      setError(errorObj);
      console.error('엑셀 템플릿 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (processId) {
      loadTemplate();
    }
  }, [processId]);

  return {
    workbook,
    loading,
    error,
    reload: loadTemplate,
  };
}
