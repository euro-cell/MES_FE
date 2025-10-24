export function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = 일요일
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
}

export function getDatesBetween(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function getWeeksBetween(start: Date, end: Date) {
  const result: { month: number; week: number }[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    const month = cur.getMonth() + 1;
    const week = getWeekOfMonth(cur);
    if (!result.find(r => r.month === month && r.week === week)) {
      result.push({ month, week });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}
