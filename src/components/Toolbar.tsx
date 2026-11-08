import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { Category } from '../types';
import { getMonthDisplayName, shiftMonth, getCurrentMonthString } from '../utils/dateUtils';
import { IconRenderer } from './IconRenderer';

interface ToolbarProps {
  currentMonth: string;
  onChangeMonth: (newMonth: string) => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  milestoneCountsByCategory: Record<string, number>;
  monthCompletionRate: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentMonth,
  onChangeMonth,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  milestoneCountsByCategory,
  monthCompletionRate,
}) => {
  const ongoingMonth = getCurrentMonthString();
  const isOngoingMonth = currentMonth === ongoingMonth;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation & Context */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onChangeMonth(shiftMonth(currentMonth, -1))}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {getMonthDisplayName(currentMonth)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onChangeMonth(shiftMonth(currentMonth, 1))}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isOngoingMonth && (
            <button
              type="button"
              onClick={() => onChangeMonth(ongoingMonth)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/50"
            >
              Jump to Ongoing Month
            </button>
          )}

          {/* Month Completion pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span>Overall Completion:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {monthCompletionRate}%
            </span>
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${monthCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative shrink-0 w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search milestones..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter dropdown or inline tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = milestoneCountsByCategory[cat.id] || 0;
              if (count === 0 && selectedCategory !== cat.id) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
