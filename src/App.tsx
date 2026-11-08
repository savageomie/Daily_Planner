/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  AppState,
  ActiveTab,
  Milestone,
  Category,
  DayRecord,
} from './types';
import {
  getInitialAppState,
  saveStateToStorage,
  getInitialMilestones,
  getInitialRecords,
  DEFAULT_CATEGORIES,
} from './utils/storage';
import {
  getDatesForMonth,
  isMilestoneScheduledForDate,
  getTodayDateString,
  getCurrentMonthString,
} from './utils/dateUtils';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { DailyBoxesMatrixView } from './components/DailyBoxesMatrixView';
import { DailyCardsView } from './components/DailyCardsView';
import { TodayFocusView } from './components/TodayFocusView';
import { CalendarMonthView } from './components/CalendarMonthView';
import { ProgressSummaryView } from './components/ProgressSummaryView';
import { MilestoneModal } from './components/MilestoneModal';
import { CategoryModal } from './components/CategoryModal';
import { DayDetailModal } from './components/DayDetailModal';
import { ExportImportModal } from './components/ExportImportModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => getInitialAppState());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [inspectedDate, setInspectedDate] = useState<string>(getTodayDateString());
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Sync state to localStorage whenever state changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Sync dark mode class on HTML document element
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const toggleDarkMode = () => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const handleChangeMonth = (newMonth: string) => {
    setState((prev) => {
      // Check if any milestones exist for this new month; if not, keep existing or generate for month
      const monthMilestones = prev.milestones.some((m) => m.targetMonth === newMonth)
        ? prev.milestones
        : [...prev.milestones, ...getInitialMilestones(newMonth)];

      return {
        ...prev,
        currentMonth: newMonth,
        milestones: monthMilestones,
      };
    });
  };

  const handleSelectCategory = (categoryId: string) => {
    setState((prev) => ({ ...prev, selectedCategory: categoryId }));
  };

  // Milestone check toggle
  const handleToggleTick = (milestoneId: string, dateStr: string) => {
    setState((prev) => {
      const existingRecord = prev.records[dateStr] || { completedMilestoneIds: [] };
      const currentCompleted = existingRecord.completedMilestoneIds || [];
      const isAlreadyDone = currentCompleted.includes(milestoneId);

      const nextCompleted = isAlreadyDone
        ? currentCompleted.filter((id) => id !== milestoneId)
        : [...currentCompleted, milestoneId];

      const updatedRecords = {
        ...prev.records,
        [dateStr]: {
          ...existingRecord,
          completedMilestoneIds: nextCompleted,
        },
      };

      // Check if all scheduled milestones for today were just finished
      const todayStr = getTodayDateString();
      if (!isAlreadyDone && dateStr === todayStr) {
        const scheduledToday = prev.milestones.filter((m) =>
          isMilestoneScheduledForDate(m, todayStr)
        );
        if (
          scheduledToday.length > 0 &&
          scheduledToday.every((m) => nextCompleted.includes(m.id))
        ) {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }

      return {
        ...prev,
        records: updatedRecords,
      };
    });
  };

  // Save (create or update) milestone
  const handleSaveMilestone = (milestone: Milestone) => {
    setState((prev) => {
      const exists = prev.milestones.some((m) => m.id === milestone.id);
      const updatedMilestones = exists
        ? prev.milestones.map((m) => (m.id === milestone.id ? milestone : m))
        : [...prev.milestones, milestone];
      return {
        ...prev,
        milestones: updatedMilestones,
      };
    });
    setEditingMilestone(null);
  };

  // Delete milestone
  const handleDeleteMilestone = (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    setState((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== milestoneId),
    }));
  };

  // Create new category
  const handleSaveCategory = (newCat: Category) => {
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  // Save day note / energy
  const handleSaveDayRecord = (dateStr: string, partial: Partial<DayRecord>) => {
    setState((prev) => {
      const existing = prev.records[dateStr] || { completedMilestoneIds: [] };
      return {
        ...prev,
        records: {
          ...prev.records,
          [dateStr]: {
            ...existing,
            ...partial,
          },
        },
      };
    });
  };

  // Open day detail
  const handleInspectDate = (dateStr: string) => {
    setInspectedDate(dateStr);
    setIsDayDetailOpen(true);
  };

  // Reset to sample data
  const handleResetSampleData = () => {
    const curMonth = getCurrentMonthString();
    const today = getTodayDateString();
    setState({
      currentMonth: curMonth,
      selectedDate: today,
      activeTab: 'matrix',
      selectedCategory: 'all',
      milestones: getInitialMilestones(curMonth),
      records: getInitialRecords(curMonth),
      categories: DEFAULT_CATEGORIES,
      darkMode: state.darkMode,
    });
  };

  // Milestone counts by category
  const milestoneCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    state.milestones.forEach((m) => {
      if (m.targetMonth === state.currentMonth) {
        counts[m.categoryId] = (counts[m.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [state.milestones, state.currentMonth]);

  // Overall Month Completion Rate %
  const monthCompletionRate = useMemo(() => {
    const dates = getDatesForMonth(state.currentMonth);
    let totalScheduled = 0;
    let totalDone = 0;

    dates.forEach((d) => {
      state.milestones.forEach((m) => {
        if (isMilestoneScheduledForDate(m, d)) {
          totalScheduled += 1;
          if (state.records[d]?.completedMilestoneIds?.includes(m.id)) {
            totalDone += 1;
          }
        }
      });
    });

    return totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0;
  }, [state.milestones, state.records, state.currentMonth]);

  // Milestones filtered for current month
  const activeMonthMilestones = useMemo(() => {
    return state.milestones.filter((m) => m.targetMonth === state.currentMonth);
  }, [state.milestones, state.currentMonth]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Header adhering to 3-zone contract */}
      <Header
        activeTab={state.activeTab}
        onSelectTab={handleSelectTab}
        onOpenNewMilestone={() => {
          setEditingMilestone(null);
          setIsMilestoneModalOpen(true);
        }}
        darkMode={state.darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Secondary Workspace Toolbar: Month Navigator & Category Filters */}
      <Toolbar
        currentMonth={state.currentMonth}
        onChangeMonth={handleChangeMonth}
        categories={state.categories}
        selectedCategory={state.selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        milestoneCountsByCategory={milestoneCountsByCategory}
        monthCompletionRate={monthCompletionRate}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {state.activeTab === 'matrix' && (
          <DailyBoxesMatrixView
            currentMonth={state.currentMonth}
            milestones={activeMonthMilestones}
            categories={state.categories}
            records={state.records}
            selectedCategory={state.selectedCategory}
            searchQuery={searchQuery}
            onToggleTick={handleToggleTick}
            onEditMilestone={(m) => {
              setEditingMilestone(m);
              setIsMilestoneModalOpen(true);
            }}
            onDeleteMilestone={handleDeleteMilestone}
            onOpenNewMilestone={() => {
              setEditingMilestone(null);
              setIsMilestoneModalOpen(true);
            }}
            onSelectDate={handleInspectDate}
          />
        )}

        {state.activeTab === 'cards' && (
          <DailyCardsView
            currentMonth={state.currentMonth}
            milestones={activeMonthMilestones}
            categories={state.categories}
            records={state.records}
            selectedCategory={state.selectedCategory}
            onToggleTick={handleToggleTick}
            onSelectDate={handleInspectDate}
            onOpenNewMilestone={() => {
              setEditingMilestone(null);
              setIsMilestoneModalOpen(true);
            }}
          />
        )}

        {state.activeTab === 'day' && (
          <TodayFocusView
            selectedDate={state.selectedDate}
            onSelectDate={(newDate) => setState((p) => ({ ...p, selectedDate: newDate }))}
            milestones={activeMonthMilestones}
            categories={state.categories}
            dayRecord={state.records[state.selectedDate]}
            onToggleTick={handleToggleTick}
            onSaveDayRecord={handleSaveDayRecord}
            onOpenNewMilestone={() => {
              setEditingMilestone(null);
              setIsMilestoneModalOpen(true);
            }}
          />
        )}

        {state.activeTab === 'calendar' && (
          <CalendarMonthView
            currentMonth={state.currentMonth}
            onChangeMonth={handleChangeMonth}
            milestones={activeMonthMilestones}
            categories={state.categories}
            records={state.records}
            selectedDate={state.selectedDate}
            onSelectDate={handleInspectDate}
            onToggleTick={handleToggleTick}
          />
        )}

        {state.activeTab === 'analytics' && (
          <ProgressSummaryView
            currentMonth={state.currentMonth}
            milestones={activeMonthMilestones}
            categories={state.categories}
            records={state.records}
            onSelectDate={handleInspectDate}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => {
          setIsMilestoneModalOpen(false);
          setEditingMilestone(null);
        }}
        onSave={handleSaveMilestone}
        categories={state.categories}
        targetMonth={state.currentMonth}
        initialData={editingMilestone}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <DayDetailModal
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        dateStr={inspectedDate}
        milestones={activeMonthMilestones}
        categories={state.categories}
        dayRecord={state.records[inspectedDate]}
        onToggleTick={handleToggleTick}
        onSaveDayRecord={handleSaveDayRecord}
      />

      <ExportImportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        appState={state}
        onImportState={(newState) => setState(newState)}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
}
