const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ExportStatusExcelParams {
  projectId: number;
  projectName: string;
  category: string;
}

// 카테고리명 매핑
const categoryNameMap: Record<string, string> = {
  Electrode: '전극공정',
  Assembly: '조립공정',
  Formation: '화성공정',
};

// 생산 현황 엑셀 다운로드 (백엔드 API 호출)
export async function exportStatusToExcel(params: ExportStatusExcelParams): Promise<void> {
  const { projectId, projectName, category } = params;

  const response = await fetch(`${API_BASE}/production/${projectId}/status/${category}/export`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('엑셀 다운로드 실패');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}_${categoryNameMap[category] || category}_생산현황.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}
