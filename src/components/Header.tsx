import React from 'react';
import { Plus, Sun, Moon, Database, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewMilestone: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDataModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewMilestone,
  darkMode,
  onToggleDarkMode,
  onOpenDataModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('matrix');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
            >
              Horizon
            </a>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {[
              { id: 'matrix', label: 'Daily Matrix' },
              { id: 'cards', label: 'Cards by Day' },
              { id: 'day', label: "Today's Focus" },
              { id: 'calendar', label: 'Month View' },
              { id: 'analytics', label: 'Progress Visuals' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id as ActiveTab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + subtle utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenDataModal}
              title="Backup & Sample Data"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>

            <PWAInstallButton />

            <button
              type="button"
              onClick={onOpenNewMilestone}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 no-scrollbar">
        {[
          { id: 'matrix', label: 'Daily Matrix' },
          { id: 'cards', label: 'Cards by Day' },
          { id: 'day', label: "Today's Focus" },
          { id: 'calendar', label: 'Month View' },
          { id: 'analytics', label: 'Progress Visuals' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id as ActiveTab)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
