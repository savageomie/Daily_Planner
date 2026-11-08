import React, { useRef, useEffect } from 'react';
import { Check, Flame, Clock, MoreVertical, Plus, Edit2, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Milestone, Category, RecordsMap } from '../types';
import {
  getDatesForMonth,
  getDayOfWeekLabel,
  isMilestoneScheduledForDate,
  calculateStreak,
  getTodayDateString,
} from '../utils/dateUtils';
import { IconRenderer } from './IconRenderer';

interface DailyBoxesMatrixViewProps {
  currentMonth: string;
  milestones: Milestone[];
  categories: Category[];
  records: RecordsMap;
  selectedCategory: string;
  searchQuery: string;
  onToggleTick: (milestoneId: string, dateStr: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onOpenNewMilestone: () => void;
  onSelectDate: (dateStr: string) => void;
}

export const DailyBoxesMatrixView: React.FC<DailyBoxesMatrixViewProps> = ({
  currentMonth,
  milestones,
  categories,
  records,
  selectedCategory,
  searchQuery,
  onToggleTick,
  onEditMilestone,
  onDeleteMilestone,
  onOpenNewMilestone,
  onSelectDate,
}) => {
  const dates = getDatesForMonth(currentMonth);
  const todayStr = getTodayDateString();
  const matrixContainerRef = useRef<HTMLDivElement>(null);
  const todayColRef = useRef<HTMLTableHeaderCellElement>(null);

  // Auto-scroll to today column on mount or month change
  useEffect(() => {
    if (todayColRef.current && matrixContainerRef.current) {
      const container = matrixContainerRef.current;
      const target = todayColRef.current;
      const leftOffset = target.offsetLeft - 320; // offset for sticky column
      if (leftOffset > 0) {
        container.scrollTo({ left: leftOffset, behavior: 'smooth' });
      }
    }
  }, [currentMonth]);

  const scrollToToday = () => {
    if (todayColRef.current && matrixContainerRef.current) {
      const target = todayColRef.current;
      const leftOffset = target.offsetLeft - 320;
      matrixContainerRef.current.scrollTo({ left: Math.max(0, leftOffset), behavior: 'smooth' });
    }
  };

  // Filter milestones by selected category and search query
  const filteredMilestones = milestones.filter((m) => {
    if (selectedCategory !== 'all' && m.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Group milestones by category
  const categoriesMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const groupedMilestones = categories
    .map((category) => {
      const items = filteredMilestones.filter((m) => m.categoryId === category.id);
      return { category, items };
    })
    .filter((g) => g.items.length > 0);

  // Check if today is in this month
  const isTodayInThisMonth = dates.includes(todayStr);

  // Quick action: check all for today
  const handleTickAllToday = () => {
    if (!isTodayInThisMonth) return;
    const scheduledForToday = filteredMilestones.filter((m) => isMilestoneScheduledForDate(m, todayStr));
    const todayRecord = records[todayStr]?.completedMilestoneIds || [];
    
    // Check all that are not yet ticked
    scheduledForToday.forEach((m) => {
      if (!todayRecord.includes(m.id)) {
        onToggleTick(m.id, todayStr);
      }
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  if (milestones.length === 0) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          No Milestones Configured for {currentMonth}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Set up the daily milestones and habits you want to accomplish for this month. We will generate daily category check boxes across every single day of the timeline.
        </p>
        <button
          type="button"
          onClick={onOpenNewMilestone}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Daily Milestone</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Daily Execution Grid</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              · {dates.length} Days Timeline · Click any box to toggle completion
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Category-coded boxes reflect each day's scheduled milestones. Solid colored check indicates done.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isTodayInThisMonth && (
            <>
              <button
                type="button"
                onClick={scrollToToday}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Jump to Today
              </button>
              <button
                type="button"
                onClick={handleTickAllToday}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete Today's All</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onOpenNewMilestone}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* The Matrix Table */}
      <div
        ref={matrixContainerRef}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto relative"
      >
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              {/* Sticky Left: Milestone Details */}
              <th className="sticky left-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 p-3 min-w-[280px] max-w-[320px] font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <span>Milestone / Category</span>
                  <span className="text-[11px] font-normal text-slate-400">Time · Cadence</span>
                </div>
              </th>

              {/* Day Columns */}
              {dates.map((d) => {
                const dayNum = d.split('-')[2];
                const dayLabel = getDayOfWeekLabel(d, true);
                const isToday = d === todayStr;
                const isWeekend = dayLabel === 'Sat' || dayLabel === 'Sun';

                return (
                  <th
                    key={d}
                    ref={isToday ? todayColRef : undefined}
                    onClick={() => onSelectDate(d)}
                    className={`p-1.5 min-w-[42px] max-w-[42px] text-center cursor-pointer transition-colors border-r border-slate-200/60 dark:border-slate-800/60 ${
                      isToday
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold'
                        : isWeekend
                        ? 'bg-slate-100/50 dark:bg-slate-800/30 text-slate-500'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] tracking-tight">{dayLabel}</span>
                      <span
                        className={`text-xs tabular-nums mt-0.5 rounded px-1 ${
                          isToday ? 'bg-indigo-600 text-white font-bold' : 'font-semibold text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>
                  </th>
                );
              })}

              {/* Sticky Right: Stats & Streaks */}
              <th className="sticky right-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 p-3 min-w-[140px] font-semibold text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] text-center">
                <span>Month Rate & Streak</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {groupedMilestones.map(({ category, items }) => (
              <React.Fragment key={category.id}>
                {/* Category Header Row */}
                <tr className="bg-slate-100/50 dark:bg-slate-800/30">
                  <td
                    colSpan={dates.length + 2}
                    className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <IconRenderer name={category.iconName} className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        {category.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        ({items.length} {items.length === 1 ? 'milestone' : 'milestones'})
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Milestones inside category */}
                {items.map((milestone) => {
                  const { currentStreak, bestStreak } = calculateStreak(milestone, records, todayStr);
                  
                  // Calculate monthly completion rate
                  let totalScheduled = 0;
                  let totalDone = 0;
                  dates.forEach((d) => {
                    if (isMilestoneScheduledForDate(milestone, d)) {
                      totalScheduled += 1;
                      if (records[d]?.completedMilestoneIds?.includes(milestone.id)) {
                        totalDone += 1;
                      }
                    }
                  });
                  const completionPercent = totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0;

                  return (
                    <tr
                      key={milestone.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Sticky Left: Title & Controls */}
                      <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50/90 dark:group-hover:bg-slate-800/90 p-3 min-w-[280px] max-w-[320px] border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: category.color }}
                              />
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                                {milestone.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="capitalize">{milestone.timeOfDay}</span>
                              {milestone.targetMinutes && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{milestone.targetMinutes}m</span>
                                  </span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="capitalize text-[10px] opacity-80">{milestone.frequency}</span>
                            </div>
                          </div>

                          {/* Action Buttons on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onEditMilestone(milestone)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit milestone"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteMilestone(milestone.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Day Tick Boxes */}
                      {dates.map((d) => {
                        const isScheduled = isMilestoneScheduledForDate(milestone, d);
                        const isDone = records[d]?.completedMilestoneIds?.includes(milestone.id) ?? false;
                        const isToday = d === todayStr;

                        return (
                          <td
                            key={d}
                            className={`p-1 text-center align-middle border-r border-slate-200/60 dark:border-slate-800/60 ${
                              isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            {isScheduled ? (
                              <button
                                type="button"
                                onClick={() => onToggleTick(milestone.id, d)}
                                title={`${milestone.title} (${d}): ${isDone ? 'Completed' : 'Not completed'}`}
                                className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                  isDone
                                    ? 'text-white shadow-xs scale-[0.98]'
                                    : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-500 hover:scale-105'
                                }`}
                                style={{
                                  backgroundColor: isDone ? category.color : undefined,
                                  borderColor: isDone ? category.color : undefined,
                                }}
                              >
                                {isDone ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 opacity-60" />
                                )}
                              </button>
                            ) : (
                              <div
                                title="Not scheduled for this day"
                                className="w-7 h-7 mx-auto flex items-center justify-center"
                              >
                                <span className="w-3 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Sticky Right: Stats */}
                      <td className="sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50/90 dark:group-hover:bg-slate-800/90 p-3 min-w-[140px] border-l border-slate-200 dark:border-slate-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="text-right">
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 tabular-nums">
                              {completionPercent}%
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {totalDone}/{totalScheduled}d
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs" title={`Current streak: ${currentStreak} days (Best: ${bestStreak})`}>
                            <Flame className={`w-3.5 h-3.5 ${currentStreak > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                            <span className="tabular-nums">{currentStreak}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}

            {/* Bottom Row: Daily Total Completion Score */}
            <tr className="bg-slate-50 dark:bg-slate-800/60 font-semibold border-t-2 border-slate-300 dark:border-slate-700">
              <td className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/95 p-3 border-r border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Daily Success Score</span>
                  <span className="text-[10px] text-slate-500">Overall Ratio</span>
                </div>
              </td>

              {dates.map((d) => {
                const isToday = d === todayStr;
                let dayScheduled = 0;
                let dayDone = 0;

                filteredMilestones.forEach((m) => {
                  if (isMilestoneScheduledForDate(m, d)) {
                    dayScheduled += 1;
                    if (records[d]?.completedMilestoneIds?.includes(m.id)) {
                      dayDone += 1;
                    }
                  }
                });

                const rate = dayScheduled > 0 ? Math.round((dayDone / dayScheduled) * 100) : 0;
                const isPerfect = dayScheduled > 0 && dayDone === dayScheduled;

                return (
                  <td
                    key={d}
                    onClick={() => onSelectDate(d)}
                    className={`p-1 text-center cursor-pointer border-r border-slate-200/60 dark:border-slate-800/60 ${
                      isToday ? 'bg-indigo-100/50 dark:bg-indigo-950/60' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[10px] font-mono tabular-nums font-bold ${
                          isPerfect
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : rate >= 60
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : rate > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {dayScheduled > 0 ? `${rate}%` : '-'}
                      </span>
                      <div className="w-5 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-0.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isPerfect ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                );
              })}

              {/* Total month average */}
              <td className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-800/95 p-3 border-l border-slate-200 dark:border-slate-800 text-center font-bold text-xs text-slate-900 dark:text-slate-100">
                <span>Month Total</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend & Guide */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-white">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Checked: Milestone Achieved</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            <span>Unchecked: Scheduled for Day</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span>Not Scheduled (Frequency Excluded)</span>
          </div>
        </div>

        <div>
          <span>Tip: Click on any column header to view and edit that day's notes & details.</span>
        </div>
      </div>
    </div>
  );
};
