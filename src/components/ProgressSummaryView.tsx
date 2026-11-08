import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Milestone, Category, RecordsMap } from '../types';
import {
  getDatesForMonth,
  isMilestoneScheduledForDate,
  getDayOfWeekLabel,
  parseYearMonth,
  getDaysInMonth,
  getShortMonthName,
  getTodayDateString,
} from '../utils/dateUtils';
import { IconRenderer } from './IconRenderer';

interface ProgressSummaryViewProps {
  currentMonth: string;
  milestones: Milestone[];
  categories: Category[];
  records: RecordsMap;
  onSelectDate: (dateStr: string) => void;
}

type SummaryScope = 'weekly' | 'monthly' | 'yearly';

export const ProgressSummaryView: React.FC<ProgressSummaryViewProps> = ({
  currentMonth,
  milestones,
  categories,
  records,
  onSelectDate,
}) => {
  const [scope, setScope] = useState<SummaryScope>('monthly');
  const todayStr = getTodayDateString();
  const { year, month } = parseYearMonth(currentMonth);
  const dates = getDatesForMonth(currentMonth);

  const categoriesMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // --- Monthly Aggregations ---
  let totalMonthScheduled = 0;
  let totalMonthCompleted = 0;
  let perfectDaysCount = 0;

  const dailyScores = dates.map((d) => {
    let sched = 0;
    let done = 0;
    milestones.forEach((m) => {
      if (isMilestoneScheduledForDate(m, d)) {
        sched += 1;
        if (records[d]?.completedMilestoneIds?.includes(m.id)) {
          done += 1;
        }
      }
    });

    totalMonthScheduled += sched;
    totalMonthCompleted += done;
    if (sched > 0 && done === sched) {
      perfectDaysCount += 1;
    }

    const rate = sched > 0 ? Math.round((done / sched) * 100) : 0;
    return { date: d, dayNum: d.split('-')[2], scheduled: sched, done, rate };
  });

  const monthCompletionRate =
    totalMonthScheduled > 0 ? Math.round((totalMonthCompleted / totalMonthScheduled) * 100) : 0;

  // Category completion breakdown for this month
  const categoryStats = categories.map((cat) => {
    let sched = 0;
    let done = 0;
    const catMilestones = milestones.filter((m) => m.categoryId === cat.id);

    dates.forEach((d) => {
      catMilestones.forEach((m) => {
        if (isMilestoneScheduledForDate(m, d)) {
          sched += 1;
          if (records[d]?.completedMilestoneIds?.includes(m.id)) {
            done += 1;
          }
        }
      });
    });

    const rate = sched > 0 ? Math.round((done / sched) * 100) : 0;
    return { category: cat, scheduled: sched, completed: done, rate, count: catMilestones.length };
  });

  const bestCategory = [...categoryStats].sort((a, b) => b.rate - a.rate)[0];

  // Milestone ranking leaderboard
  const milestoneLeaderboard = milestones.map((m) => {
    let sched = 0;
    let done = 0;
    dates.forEach((d) => {
      if (isMilestoneScheduledForDate(m, d)) {
        sched += 1;
        if (records[d]?.completedMilestoneIds?.includes(m.id)) {
          done += 1;
        }
      }
    });
    const rate = sched > 0 ? Math.round((done / sched) * 100) : 0;
    return { milestone: m, scheduled: sched, done, rate };
  }).sort((a, b) => b.rate - a.rate);

  // --- Weekly Breakdown ---
  // Group days into weeks: Week 1 (1-7), Week 2 (8-14), Week 3 (15-21), Week 4 (22-28), Week 5 (29-end)
  const weeksData = [
    { name: 'Week 1', range: 'Days 1 - 7', start: 1, end: 7 },
    { name: 'Week 2', range: 'Days 8 - 14', start: 8, end: 14 },
    { name: 'Week 3', range: 'Days 15 - 21', start: 15, end: 21 },
    { name: 'Week 4', range: 'Days 22 - 28', start: 22, end: 28 },
    { name: 'Week 5', range: `Days 29 - ${dates.length}`, start: 29, end: dates.length },
  ]
    .filter((w) => w.start <= dates.length)
    .map((w) => {
      let sched = 0;
      let done = 0;
      for (let day = w.start; day <= Math.min(w.end, dates.length); day++) {
        const dStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
        milestones.forEach((m) => {
          if (isMilestoneScheduledForDate(m, dStr)) {
            sched += 1;
            if (records[dStr]?.completedMilestoneIds?.includes(m.id)) {
              done += 1;
            }
          }
        });
      }
      const rate = sched > 0 ? Math.round((done / sched) * 100) : 0;
      return { ...w, scheduled: sched, completed: done, rate };
    });

  // Day of Week completion patterns (Mon vs Tue vs Wed...)
  const dayOfWeekStats = [
    { day: 'Mon', index: 1, sched: 0, done: 0 },
    { day: 'Tue', index: 2, sched: 0, done: 0 },
    { day: 'Wed', index: 3, sched: 0, done: 0 },
    { day: 'Thu', index: 4, sched: 0, done: 0 },
    { day: 'Fri', index: 5, sched: 0, done: 0 },
    { day: 'Sat', index: 6, sched: 0, done: 0 },
    { day: 'Sun', index: 0, sched: 0, done: 0 },
  ].map((dow) => {
    dates.forEach((d) => {
      const parts = d.split('-').map(Number);
      const dayDate = new Date(parts[0], parts[1] - 1, parts[2]);
      if (dayDate.getDay() === dow.index) {
        milestones.forEach((m) => {
          if (isMilestoneScheduledForDate(m, d)) {
            dow.sched += 1;
            if (records[d]?.completedMilestoneIds?.includes(m.id)) {
              dow.done += 1;
            }
          }
        });
      }
    });
    const rate = dow.sched > 0 ? Math.round((dow.done / dow.sched) * 100) : 0;
    return { ...dow, rate };
  });

  // --- Yearly Aggregations ---
  // 12 months for current year
  const yearlyMonths = Array.from({ length: 12 }, (_, i) => {
    const mNum = i + 1;
    const mStr = `${year}-${String(mNum).padStart(2, '0')}`;
    const daysCount = getDaysInMonth(year, mNum);
    let sched = 0;
    let done = 0;

    for (let day = 1; day <= daysCount; day++) {
      const dStr = `${mStr}-${String(day).padStart(2, '0')}`;
      milestones.forEach((m) => {
        if (isMilestoneScheduledForDate(m, dStr)) {
          sched += 1;
          if (records[dStr]?.completedMilestoneIds?.includes(m.id)) {
            done += 1;
          }
        }
      });
    }

    const rate = sched > 0 ? Math.round((done / sched) * 100) : 0;
    const isCurrent = mNum === month;

    return {
      monthNum: mNum,
      name: getShortMonthName(mNum),
      yearMonth: mStr,
      scheduled: sched,
      completed: done,
      rate,
      isCurrent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Scope Switcher & Summary Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Progress & Timeline Visualizations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic data visualization of your habits, completion streaks, and long-term milestones.
          </p>
        </div>

        {/* Scope Tabs: Weekly / Monthly / Yearly */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {[
            { id: 'weekly', label: 'Weekly Summary' },
            { id: 'monthly', label: 'Monthly Summary' },
            { id: 'yearly', label: 'Yearly Summary' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScope(tab.id as SummaryScope)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                scope === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Headline Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Completion</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {monthCompletionRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalMonthCompleted} of {totalMonthScheduled} ticks logged
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Perfect Days (100%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {perfectDaysCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Flawless execution days
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Top Category</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
            {bestCategory?.category.name || 'All Equal'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            {bestCategory ? `${bestCategory.rate}% success rate` : 'Tracking ongoing'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Milestones</span>
            <Layers className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {milestones.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {categories.length} categories
          </span>
        </div>
      </div>

      {/* ========================================================
          1. WEEKLY PROGRESS SUMMARY VIEW
         ======================================================== */}
      {scope === 'weekly' && (
        <div className="space-y-6">
          {/* Week by Week Progress Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Week-by-Week Performance Breakdown ({currentMonth})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {weeksData.map((wk) => (
                <div
                  key={wk.name}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {wk.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{wk.range}</span>
                    </div>

                    <div className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100 my-2 tabular-nums">
                      {wk.rate}%
                    </div>
                  </div>

                  <div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${wk.rate}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {wk.completed} of {wk.scheduled} completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day of Week Consistency Pattern */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Weekly Day-of-the-Week Consistency Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Identifies which days of the week you show the highest execution rate.
            </p>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-4 pb-2">
              {dayOfWeekStats.map((d) => {
                const heightPercent = d.rate;
                return (
                  <div key={d.day} className="flex flex-col items-center h-full justify-end">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 tabular-nums">
                      {d.rate}%
                    </span>
                    <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-lg flex items-end h-32 p-1">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          d.rate >= 80
                            ? 'bg-emerald-500'
                            : d.rate >= 50
                            ? 'bg-indigo-600'
                            : d.rate > 0
                            ? 'bg-amber-500'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ height: `${Math.max(4, heightPercent)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                      {d.day}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {d.done}/{d.sched}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MONTHLY PROGRESS SUMMARY VIEW
         ======================================================== */}
      {scope === 'monthly' && (
        <div className="space-y-6">
          {/* Daily Trend Chart (All days 1..30) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Daily Execution Rhythm ({currentMonth})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily percentage of scheduled milestones completed.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                Goal: 85%+ Consistency
              </span>
            </div>

            {/* SVG / Bar Chart */}
            <div className="flex items-end gap-1 sm:gap-1.5 h-40 pt-4 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
              {dailyScores.map((ds) => {
                const isToday = ds.date === todayStr;
                return (
                  <div
                    key={ds.date}
                    onClick={() => onSelectDate(ds.date)}
                    className="flex-1 min-w-[14px] flex flex-col items-center h-full justify-end group cursor-pointer"
                    title={`${ds.date}: ${ds.rate}% (${ds.done}/${ds.scheduled})`}
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80 ${
                        ds.rate === 100
                          ? 'bg-emerald-500'
                          : ds.rate >= 60
                          ? 'bg-indigo-600'
                          : ds.rate > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-200 dark:bg-slate-800'
                      } ${isToday ? 'ring-2 ring-indigo-400' : ''}`}
                      style={{ height: `${Math.max(4, ds.rate)}%` }}
                    />
                    <span className="text-[9px] text-slate-400 font-mono mt-1 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                      {ds.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown & Leaderboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Performance by Category
              </h3>

              <div className="space-y-3">
                {categoryStats.map((item) => (
                  <div key={item.category.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.category.color }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.category.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {item.rate}% ({item.completed}/{item.scheduled})
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.rate}%`,
                          backgroundColor: item.category.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Consistency Leaderboard */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Milestone Consistency Ranking
              </h3>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {milestoneLeaderboard.map((item, idx) => {
                  const cat = categoriesMap.get(item.milestone.categoryId);
                  return (
                    <div
                      key={item.milestone.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-slate-400 text-[11px] w-4">
                          #{idx + 1}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color || '#6366f1' }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.milestone.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {item.rate}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({item.done}/{item.scheduled}d)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. YEARLY PROGRESS SUMMARY VIEW
         ======================================================== */}
      {scope === 'yearly' && (
        <div className="space-y-6">
          {/* 12-Month Year Trajectory */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Year {year} Milestones & Timeline Performance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  12-month progress tracking. Month {month} ({getShortMonthName(month)}) is ongoing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3">
              {yearlyMonths.map((ym) => (
                <div
                  key={ym.monthNum}
                  className={`p-3.5 rounded-xl border transition-all ${
                    ym.isCurrent
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {ym.name}
                    </span>
                    {ym.isCurrent && (
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-1 py-0.2 rounded">
                        NOW
                      </span>
                    )}
                  </div>

                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 my-1 tabular-nums">
                    {ym.rate}%
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full ${
                        ym.isCurrent ? 'bg-indigo-600' : 'bg-slate-500'
                      }`}
                      style={{ width: `${ym.rate}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {ym.completed} completed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Year Contribution Intensity Grid (52 weeks) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Annual Timeline Heatmap ({year})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Habit frequency and execution intensity across the year.
                </p>
              </div>

              {/* Intensity Scale Legend */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[10px]">Less</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-200 dark:bg-indigo-950" />
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400 dark:bg-indigo-800" />
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-600" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span className="text-[10px]">More</span>
              </div>
            </div>

            {/* 52-week grid preview */}
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
                {Array.from({ length: 52 * 7 }).map((_, i) => {
                  const dayOffset = i;
                  const d = new Date(year, 0, 1 + dayOffset);
                  if (d.getFullYear() !== year) return null;

                  const yStr = String(d.getFullYear());
                  const mStr = String(d.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(d.getDate()).padStart(2, '0');
                  const fullDateStr = `${yStr}-${mStr}-${dayStr}`;

                  const dayRecord = records[fullDateStr];
                  const completedCount = dayRecord?.completedMilestoneIds?.length || 0;

                  let colorClass = 'bg-slate-100 dark:bg-slate-800/80';
                  if (completedCount >= 5) {
                    colorClass = 'bg-emerald-500';
                  } else if (completedCount >= 3) {
                    colorClass = 'bg-indigo-600';
                  } else if (completedCount >= 1) {
                    colorClass = 'bg-indigo-300 dark:bg-indigo-900';
                  }

                  return (
                    <div
                      key={fullDateStr}
                      title={`${fullDateStr}: ${completedCount} milestones`}
                      className={`w-3 h-3 rounded-xs ${colorClass} transition-colors hover:ring-1 hover:ring-indigo-400 cursor-pointer`}
                      onClick={() => onSelectDate(fullDateStr)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
