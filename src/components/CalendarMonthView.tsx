import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Milestone, Category, RecordsMap } from '../types';
import {
  parseYearMonth,
  getDaysInMonth,
  getDayOfWeek,
  getDayOfWeekLabel,
  isMilestoneScheduledForDate,
  getTodayDateString,
  shiftMonth,
  getMonthDisplayName,
} from '../utils/dateUtils';

interface CalendarMonthViewProps {
  currentMonth: string;
  onChangeMonth: (m: string) => void;
  milestones: Milestone[];
  categories: Category[];
  records: RecordsMap;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onToggleTick: (milestoneId: string, dateStr: string) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentMonth,
  onChangeMonth,
  milestones,
  categories,
  records,
  selectedDate,
  onSelectDate,
  onToggleTick,
}) => {
  const { year, month } = parseYearMonth(currentMonth);
  const totalDays = getDaysInMonth(year, month);
  const firstDayOfWeek = getDayOfWeek(`${currentMonth}-01`); // 0 (Sun) - 6 (Sat)
  const todayStr = getTodayDateString();

  const categoriesMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Days of week header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar cells: empty padding days + actual days
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    const dStr = String(d).padStart(2, '0');
    calendarCells.push(`${currentMonth}-${dStr}`);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {getMonthDisplayName(currentMonth)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any day to inspect its milestones and log reflection notes.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonth(currentMonth, -1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonth(currentMonth, 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-column Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday headers */}
        {weekDays.map((wd) => (
          <div
            key={wd}
            className="py-1 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
          >
            {wd}
          </div>
        ))}

        {/* Day cells */}
        {calendarCells.map((dateStr, idx) => {
          if (!dateStr) {
            return (
              <div
                key={`empty_${idx}`}
                className="h-28 rounded-lg bg-slate-50/40 dark:bg-slate-900/40 border border-transparent"
              />
            );
          }

          const dayNum = dateStr.split('-')[2];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          const scheduled = milestones.filter((m) => isMilestoneScheduledForDate(m, dateStr));
          const completedIds = records[dateStr]?.completedMilestoneIds || [];
          const totalScheduled = scheduled.length;
          const totalCompleted = scheduled.filter((m) => completedIds.includes(m.id)).length;
          const rate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
          const isAllDone = totalScheduled > 0 && totalCompleted === totalScheduled;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`h-28 p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                  : isToday
                  ? 'border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-900 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Day Number & Score */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {dayNum}
                </span>

                {totalScheduled > 0 && (
                  <span
                    className={`text-[10px] font-mono font-semibold tabular-nums ${
                      isAllDone
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {totalCompleted}/{totalScheduled}
                  </span>
                )}
              </div>

              {/* Milestone Mini Dots/Pills by Category */}
              <div className="my-1 space-y-1 overflow-hidden">
                {scheduled.slice(0, 3).map((m) => {
                  const isDone = completedIds.includes(m.id);
                  const cat = categoriesMap.get(m.categoryId);
                  return (
                    <div
                      key={m.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTick(m.id, dateStr);
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate transition-colors ${
                        isDone
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 line-through'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                      title={m.title}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: isDone ? '#94a3b8' : cat?.color || '#6366f1' }}
                      />
                      <span className="truncate">{m.title}</span>
                    </div>
                  );
                })}
                {scheduled.length > 3 && (
                  <span className="text-[9px] text-slate-400 block pl-1">
                    +{scheduled.length - 3} more
                  </span>
                )}
              </div>

              {/* Bottom Progress Bar */}
              {totalScheduled > 0 && (
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isAllDone ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
