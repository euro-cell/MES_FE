// 시작일~종료일 사이의 모든 월 반환
export function getMonthsBetween(startDate: string, endDate: string) {
  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate || new Date().toISOString());
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// 월의 일수 반환
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 년도 전환 처리한 월 라벨
export function formatMonthLabel(year: number, month: number, previousYear?: number): string {
  const monthStr = `${month}월`;
  if (previousYear !== undefined && year !== previousYear) {
    return `${year}년 ${monthStr}`;
  }
  return monthStr;
}

// "2025-01" → { year: 2025, month: 1 }
export function parseMonthParam(monthParam: string) {
  const [year, month] = monthParam.split('-').map(Number);
  return { year, month };
}
