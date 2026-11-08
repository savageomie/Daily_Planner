import { Milestone } from '../types';

export function getTodayDateString(): string {
  // Using user's current time context (Nov 6, 2026) or fallback to system date
  const now = new Date();
  // If system date is not 2026, fallback gracefully to 2026-11-06 or current system date
  const year = now.getFullYear();
  // Ensure formatted string YYYY-MM-DD
  const y = String(year).padStart(4, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthString(): string {
  const today = getTodayDateString();
  return today.slice(0, 7);
}

export function parseYearMonth(ym: string): { year: number; month: number } {
  const parts = ym.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10), // 1-12
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getDatesForMonth(yearMonth: string): string[] {
  const { year, month } = parseYearMonth(yearMonth);
  const totalDays = getDaysInMonth(year, month);
  const dates: string[] = [];
  const mStr = String(month).padStart(2, '0');
  for (let i = 1; i <= totalDays; i++) {
    const dStr = String(i).padStart(2, '0');
    dates.push(`${year}-${mStr}-${dStr}`);
  }
  return dates;
}

export function getMonthDisplayName(yearMonth: string): string {
  const { year, month } = parseYearMonth(yearMonth);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function getShortMonthName(monthNum: number): string {
  // monthNum is 1-12
  const date = new Date(2026, monthNum - 1, 1);
  return date.toLocaleString('default', { month: 'short' });
}

export function getDayOfWeek(dateStr: string): number {
  // 0 is Sunday, 1 is Monday, etc.
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getDay();
}

export function getDayOfWeekLabel(dateStr: string, short = true): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleString('default', { weekday: short ? 'short' : 'long' });
}

export function isMilestoneScheduledForDate(milestone: Milestone, dateStr: string): boolean {
  const dayOfWeek = getDayOfWeek(dateStr); // 0 (Sun) - 6 (Sat)
  
  // Also check if milestone targetMonth matches, or if it spans
  if (milestone.targetMonth && !dateStr.startsWith(milestone.targetMonth)) {
    return false;
  }

  switch (milestone.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return Boolean(milestone.customDays && milestone.customDays.includes(dayOfWeek));
    default:
      return true;
  }
}

export function shiftMonth(yearMonth: string, delta: number): string {
  const { year, month } = parseYearMonth(yearMonth);
  let newMonth = month + delta;
  let newYear = year;
  while (newMonth > 12) {
    newMonth -= 12;
    newYear += 1;
  }
  while (newMonth < 1) {
    newMonth += 12;
    newYear -= 1;
  }
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

export function calculateStreak(
  milestone: Milestone,
  records: Record<string, { completedMilestoneIds: string[] }>,
  refDateStr: string
): { currentStreak: number; bestStreak: number } {
  const dates = getDatesForMonth(milestone.targetMonth);
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const d of dates) {
    // Only count up to refDateStr
    if (d > refDateStr) break;

    const scheduled = isMilestoneScheduledForDate(milestone, d);
    if (!scheduled) continue;

    const dayRecord = records[d];
    const isCompleted = dayRecord?.completedMilestoneIds?.includes(milestone.id);

    if (isCompleted) {
      tempStreak += 1;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak backwards from refDateStr
  let walkStreak = 0;
  const reversedDates = [...dates].filter(d => d <= refDateStr).reverse();
  for (const d of reversedDates) {
    const scheduled = isMilestoneScheduledForDate(milestone, d);
    if (!scheduled) continue;

    const dayRecord = records[d];
    const isCompleted = dayRecord?.completedMilestoneIds?.includes(milestone.id);
    if (isCompleted) {
      walkStreak += 1;
    } else {
      break;
    }
  }
  currentStreak = walkStreak;

  return { currentStreak, bestStreak };
}

export function getWeekIndex(dateStr: string): number {
  const d = parseInt(dateStr.split('-')[2], 10);
  return Math.ceil(d / 7); // 1, 2, 3, 4, 5
}
