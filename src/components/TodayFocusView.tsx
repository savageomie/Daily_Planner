import React, { useState } from 'react';
import {
  Check,
  Clock,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Milestone, Category, DayRecord, CustomTask, TimeOfDay } from '../types';
import { isMilestoneScheduledForDate, getDayOfWeekLabel, getTodayDateString } from '../utils/dateUtils';
import { IconRenderer } from './IconRenderer';

interface TodayFocusViewProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  milestones: Milestone[];
  categories: Category[];
  dayRecord?: DayRecord;
  tasks: CustomTask[];
  onToggleTick: (milestoneId: string, dateStr: string) => void;
  onSaveDayRecord: (dateStr: string, record: Partial<DayRecord>) => void;
  onOpenNewMilestone: () => void;
  onAddCustomTask: (dateStr: string, title: string) => void;
  onToggleCustomTask: (taskId: string) => void;
  onDeleteCustomTask: (taskId: string) => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  selectedDate,
  onSelectDate,
  milestones,
  categories,
  dayRecord,
  tasks,
  onToggleTick,
  onSaveDayRecord,
  onOpenNewMilestone,
  onAddCustomTask,
  onToggleCustomTask,
  onDeleteCustomTask,
}) => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<'all' | TimeOfDay>('all');
  const [noteText, setNoteText] = useState(dayRecord?.note || '');
  const [energyLevel, setEnergyLevel] = useState<number>(dayRecord?.energyLevel || 4);
  const [isSavedNote, setIsSavedNote] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Filter milestones scheduled for this selected day
  const scheduledMilestones = milestones.filter((m) => isMilestoneScheduledForDate(m, selectedDate));
  const completedIds = dayRecord?.completedMilestoneIds || [];

  const timeFiltered = scheduledMilestones.filter((m) => {
    if (activeTimeFilter === 'all') return true;
    return m.timeOfDay === activeTimeFilter || m.timeOfDay === 'anytime';
  });

  const totalMilestones = scheduledMilestones.length;
  const completedMilestones = scheduledMilestones.filter((m) => completedIds.includes(m.id)).length;

  // Day-specific custom tasks (filtered for selectedDate)
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const completedTasks = dayTasks.filter((t) => t.completed).length;

  // Overall combined score
  const totalItems = totalMilestones + dayTasks.length;
  const totalCompleted = completedMilestones + completedTasks;
  const overallPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
  const isAllComplete = totalItems > 0 && totalCompleted === totalItems;

  const categoriesMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const handleToggleMilestone = (milestoneId: string) => {
    onToggleTick(milestoneId, selectedDate);
    if (!completedIds.includes(milestoneId) && totalCompleted + 1 === totalItems) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleToggleTask = (taskId: string) => {
    onToggleCustomTask(taskId);
    const task = dayTasks.find((t) => t.id === taskId);
    if (task && !task.completed && totalCompleted + 1 === totalItems) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    onAddCustomTask(selectedDate, newTaskInput.trim());
    setNewTaskInput('');
  };

  const handleSaveNote = () => {
    onSaveDayRecord(selectedDate, {
      note: noteText.trim(),
      energyLevel: energyLevel as 1 | 2 | 3 | 4 | 5,
    });
    setIsSavedNote(true);
    setTimeout(() => setIsSavedNote(false), 2000);
  };

  const handleDayShift = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d + delta);
    const newY = String(date.getFullYear()).padStart(4, '0');
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    onSelectDate(`${newY}-${newM}-${newD}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Date Header & Quick Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => handleDayShift(-1)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Previous Day"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {getDayOfWeekLabel(selectedDate, false)}
            </span>

            <button
              type="button"
              onClick={() => handleDayShift(1)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Next Day"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            {isToday ? (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                TODAY
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSelectDate(todayStr)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Jump to Today
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {selectedDate}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAllComplete
              ? '🎉 Outstanding! All milestones and custom tasks completed for this day!'
              : `${totalCompleted} of ${totalItems} daily items completed. Keep your momentum going!`}
          </p>
        </div>

        {/* Combined Progress Wheel */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isAllComplete ? 'text-emerald-500' : 'text-indigo-600'}
                strokeDasharray={`${overallPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-bold text-xs text-slate-900 dark:text-slate-100 tabular-nums">
              {overallPercent}%
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Total Day Focus
            </div>
            <div className="text-xs text-slate-500 font-mono tabular-nums">
              {totalCompleted} / {totalItems} Complete
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {completedMilestones}/{totalMilestones} habits · {completedTasks}/{dayTasks.length} tasks
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          FEATURE 3: DAY-SPECIFIC CUSTOM TASKS (Non-repetitive)
         ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Day-Specific Tasks
            </h3>
            <span className="text-xs text-slate-400">
              (Non-repetitive to-dos for {selectedDate} only)
            </span>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            {completedTasks} of {dayTasks.length} done
          </span>
        </div>

        {/* Fast Inline Add Task Input */}
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add a one-time task for today (e.g. Call client, Pay electricity bill, Return book)..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newTaskInput.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          {dayTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No single-day tasks added for this date yet. Type above to quickly capture non-repeating to-dos.
            </p>
          ) : (
            dayTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 shadow-2xs'
                }`}
              >
                <div
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <button
                    type="button"
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                      task.completed
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-400 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <span
                    className={`text-xs truncate ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteCustomTask(task.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================
          DAILY RECURRING MILESTONES SECTION
         ======================================================== */}
      <div className="space-y-4">
        {/* Time-of-Day Filter Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Daily Milestones & Habits
            </h3>
            <span className="text-xs text-slate-400">
              ({completedMilestones} of {totalMilestones} done)
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: 'all', label: 'All' },
              { id: 'morning', label: 'Morning' },
              { id: 'afternoon', label: 'Afternoon' },
              { id: 'evening', label: 'Evening' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTimeFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTimeFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Milestones Checklist */}
        <div className="space-y-3">
          {timeFiltered.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                No recurring milestones scheduled for this day or time block.
              </p>
              <button
                type="button"
                onClick={onOpenNewMilestone}
                className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                + Add Milestone
              </button>
            </div>
          ) : (
            timeFiltered.map((milestone) => {
              const isDone = completedIds.includes(milestone.id);
              const cat = categoriesMap.get(milestone.categoryId);

              return (
                <div
                  key={milestone.id}
                  onClick={() => handleToggleMilestone(milestone.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#6366f1'}15`,
                        color: cat?.color || '#6366f1',
                      }}
                    >
                      <IconRenderer name={cat?.iconName || 'Target'} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {milestone.title}
                        </h3>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${cat?.color || '#6366f1'}20`,
                            color: cat?.color || '#6366f1',
                          }}
                        >
                          {cat?.name}
                        </span>
                      </div>

                      {milestone.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {milestone.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="capitalize">{milestone.timeOfDay}</span>
                        {milestone.targetMinutes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{milestone.targetMinutes} mins target</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Big Tactile Tick Box */}
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? 'text-white shadow-xs scale-95'
                        : 'border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-800'
                    }`}
                    style={{
                      backgroundColor: isDone ? cat?.color || '#10b981' : undefined,
                      borderColor: isDone ? cat?.color || '#10b981' : undefined,
                    }}
                  >
                    {isDone && <Check className="w-5 h-5 stroke-[3]" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Daily Notes & Reflection Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Daily Reflection & Energy
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Energy Level:</span>
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergyLevel(level)}
                className={`w-6 h-6 rounded-md text-xs font-mono font-bold transition-all ${
                  energyLevel === level
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Record daily takeaways, thoughts, wins, or adjustments for tomorrow..."
          className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isSavedNote && '✓ Daily reflection saved!'}
          </span>
          <button
            type="button"
            onClick={handleSaveNote}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Save Day Note
          </button>
        </div>
      </div>
    </div>
  );
};
