import React, { useState, useEffect } from 'react';
import { X, Check, MessageSquare, Flame } from 'lucide-react';
import { Milestone, Category, DayRecord } from '../types';
import { isMilestoneScheduledForDate, getDayOfWeekLabel, getTodayDateString } from '../utils/dateUtils';
import { IconRenderer } from './IconRenderer';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  milestones: Milestone[];
  categories: Category[];
  dayRecord?: DayRecord;
  onToggleTick: (milestoneId: string, dateStr: string) => void;
  onSaveDayRecord: (dateStr: string, record: Partial<DayRecord>) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  milestones,
  categories,
  dayRecord,
  onToggleTick,
  onSaveDayRecord,
}) => {
  const [note, setNote] = useState(dayRecord?.note || '');
  const [energyLevel, setEnergyLevel] = useState<number>(dayRecord?.energyLevel || 4);

  useEffect(() => {
    setNote(dayRecord?.note || '');
    setEnergyLevel(dayRecord?.energyLevel || 4);
  }, [dayRecord, dateStr]);

  if (!isOpen) return null;

  const todayStr = getTodayDateString();
  const isToday = dateStr === todayStr;
  const scheduled = milestones.filter((m) => isMilestoneScheduledForDate(m, dateStr));
  const completedIds = dayRecord?.completedMilestoneIds || [];
  const categoriesMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const handleSave = () => {
    onSaveDayRecord(dateStr, {
      note: note.trim(),
      energyLevel: energyLevel as 1 | 2 | 3 | 4 | 5,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {getDayOfWeekLabel(dateStr, false)}
              </span>
              {isToday && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded">
                  TODAY
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dateStr}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Milestones checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Scheduled Milestones ({completedIds.length}/{scheduled.length} completed)
              </label>
            </div>

            <div className="space-y-2">
              {scheduled.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No milestones scheduled for this day of the week.
                </p>
              ) : (
                scheduled.map((m) => {
                  const isDone = completedIds.includes(m.id);
                  const cat = categoriesMap.get(m.categoryId);
                  return (
                    <div
                      key={m.id}
                      onClick={() => onToggleTick(m.id, dateStr)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color || '#6366f1' }}
                        />
                        <span
                          className={`text-xs font-medium truncate ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          isDone
                            ? 'text-white'
                            : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
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
          </div>

          {/* Energy Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Energy & Focus Level (1 to 5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyLevel(lvl)}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                    energyLevel === lvl
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Day Reflection Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Day Reflection & Progress Note</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What went well today? Any blockers or adjustments?"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            Save Day Note
          </button>
        </div>
      </div>
    </div>
  );
};
