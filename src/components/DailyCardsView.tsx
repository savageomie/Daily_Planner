import React from 'react';
import { Check, Clock, Calendar as CalendarIcon, MessageSquare, Sparkles } from 'lucide-react';
import { Milestone, Category, RecordsMap } from '../types';
import {
  getDatesForMonth,
  getDayOfWeekLabel,
  isMilestoneScheduledForDate,
  getTodayDateString,
} from '../utils/dateUtils';
import { IconRenderer } from './IconRenderer';

interface DailyCardsViewProps {
  currentMonth: string;
  milestones: Milestone[];
  categories: Category[];
  records: RecordsMap;
  selectedCategory: string;
  onToggleTick: (milestoneId: string, dateStr: string) => void;
  onSelectDate: (dateStr: string) => void;
  onOpenNewMilestone: () => void;
}

export const DailyCardsView: React.FC<DailyCardsViewProps> = ({
  currentMonth,
  milestones,
  categories,
  records,
  selectedCategory,
  onToggleTick,
  onSelectDate,
  onOpenNewMilestone,
}) => {
  const dates = getDatesForMonth(currentMonth);
  const todayStr = getTodayDateString();
  const categoriesMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const filteredMilestones = milestones.filter((m) => {
    if (selectedCategory !== 'all' && m.categoryId !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Day-by-Day Milestone Cards
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Card-based layout for each day of {currentMonth}. Tick any milestone box directly.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewMilestone}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          + Add Milestone
        </button>
      </div>

      {/* Grid of Day Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dates.map((d) => {
          const isToday = d === todayStr;
          const dayNum = d.split('-')[2];
          const dayLabel = getDayOfWeekLabel(d, false);
          const dayRecord = records[d];
          const completedIds = dayRecord?.completedMilestoneIds || [];

          // Scheduled milestones for this day
          const scheduled = filteredMilestones.filter((m) => isMilestoneScheduledForDate(m, d));
          const totalScheduled = scheduled.length;
          const completedCount = scheduled.filter((m) => completedIds.includes(m.id)).length;
          const percent = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;
          const isComplete = totalScheduled > 0 && completedCount === totalScheduled;

          return (
            <div
              key={d}
              className={`rounded-xl border transition-all flex flex-col bg-white dark:bg-slate-900 shadow-xs ${
                isToday
                  ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isComplete
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-normal leading-none mb-0.5">
                      {dayLabel.slice(0, 3)}
                    </span>
                    <span className="leading-none tabular-nums font-mono text-sm">{dayNum}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {dayLabel}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded">
                          TODAY
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {completedCount} of {totalScheduled} done
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-mono font-bold tabular-nums ${
                      isComplete
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : percent > 0
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {percent}%
                  </span>
                  <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Body: Milestones checklist */}
              <div className="p-3.5 space-y-2 flex-1">
                {scheduled.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No milestones scheduled for this day
                  </p>
                ) : (
                  scheduled.map((m) => {
                    const isDone = completedIds.includes(m.id);
                    const cat = categoriesMap.get(m.categoryId);

                    return (
                      <div
                        key={m.id}
                        onClick={() => onToggleTick(m.id, d)}
                        className={`group p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isDone
                            ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                            : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Colored category indicator dot */}
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat?.color || '#6366f1' }}
                            title={cat?.name}
                          />

                          <div className="min-w-0">
                            <span
                              className={`text-xs block truncate ${
                                isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'
                              }`}
                            >
                              {m.title}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span className="capitalize">{m.timeOfDay}</span>
                              {m.targetMinutes && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{m.targetMinutes}m</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox button */}
                        <button
                          type="button"
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${
                            isDone
                              ? 'text-white'
                              : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-slate-400'
                          }`}
                          style={{
                            backgroundColor: isDone ? cat?.color || '#10b981' : undefined,
                            borderColor: isDone ? cat?.color || '#10b981' : undefined,
                          }}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Card Footer: Quick Note or Day Details */}
              <div className="px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onSelectDate(d)}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{dayRecord?.note ? 'View Day Note' : '+ Add Note'}</span>
                </button>

                {dayRecord?.energyLevel && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                    Energy: {dayRecord.energyLevel}/5
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
