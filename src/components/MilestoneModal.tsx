import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Clock } from 'lucide-react';
import { Milestone, Category, FrequencyType, TimeOfDay } from '../types';
import { IconRenderer } from './IconRenderer';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: Milestone) => void;
  categories: Category[];
  targetMonth: string;
  initialData?: Milestone | null;
  onOpenNewCategory: () => void;
}

const PRESET_TEMPLATES = [
  { title: 'Morning 5km Run or HIIT', categoryId: 'health', frequency: 'daily' as const, timeOfDay: 'morning' as const, targetMinutes: 30, priority: 'high' as const },
  { title: 'Deep Work Block (90 mins)', categoryId: 'work', frequency: 'weekdays' as const, timeOfDay: 'morning' as const, targetMinutes: 90, priority: 'high' as const },
  { title: 'Read 25 Pages of Non-Fiction', categoryId: 'learning', frequency: 'daily' as const, timeOfDay: 'evening' as const, targetMinutes: 30, priority: 'medium' as const },
  { title: 'Hydrate 2.5L & Clean Nutrition', categoryId: 'health', frequency: 'daily' as const, timeOfDay: 'anytime' as const, priority: 'medium' as const },
  { title: 'Evening Reflection & 3 Priorities', categoryId: 'mindfulness', frequency: 'daily' as const, timeOfDay: 'evening' as const, targetMinutes: 15, priority: 'low' as const },
  { title: 'Ship Side Project Commit', categoryId: 'creative', frequency: 'weekdays' as const, timeOfDay: 'afternoon' as const, targetMinutes: 45, priority: 'medium' as const },
];

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  targetMonth,
  initialData,
  onOpenNewCategory,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'health');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [targetMinutes, setTargetMinutes] = useState<number | undefined>(30);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategoryId(initialData.categoryId);
      setFrequency(initialData.frequency);
      setCustomDays(initialData.customDays || [1, 2, 3, 4, 5]);
      setTimeOfDay(initialData.timeOfDay);
      setTargetMinutes(initialData.targetMinutes);
      setPriority(initialData.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'health');
      setFrequency('daily');
      setCustomDays([1, 2, 3, 4, 5]);
      setTimeOfDay('morning');
      setTargetMinutes(30);
      setPriority('medium');
    }
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTitle(preset.title);
    setCategoryId(categories.some(c => c.id === preset.categoryId) ? preset.categoryId : categories[0]?.id || 'health');
    setFrequency(preset.frequency);
    setTimeOfDay(preset.timeOfDay);
    setTargetMinutes(preset.targetMinutes);
    setPriority(preset.priority);
  };

  const handleToggleCustomDay = (dayVal: number) => {
    if (customDays.includes(dayVal)) {
      if (customDays.length > 1) {
        setCustomDays(customDays.filter(d => d !== dayVal));
      }
    } else {
      setCustomDays([...customDays, dayVal].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedMilestone: Milestone = {
      id: initialData ? initialData.id : `m_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      timeOfDay,
      targetMonth: initialData ? initialData.targetMonth : targetMonth,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
      targetMinutes: targetMinutes ? Number(targetMinutes) : undefined,
      priority,
    };

    onSave(savedMilestone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl my-8 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Daily Milestone' : 'Add Daily Milestone'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured for monthly timeline: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{targetMonth}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets for New Milestone */}
        {!initialData && (
          <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quick Start Templates:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TEMPLATES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {p.title.split(' ')[0]} {p.title.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Milestone Name / Goal <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 45-min Strength Training, Deep Work Block, 20 Pages Read"
              required
              autoFocus
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Intention (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this matters, specific guideline, or focus cue"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Category Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <button
                type="button"
                onClick={onOpenNewCategory}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>New Category</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-medium ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency & Custom Schedule */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Schedule Cadence
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                { id: 'daily', label: 'Every Day' },
                { id: 'weekdays', label: 'Mon - Fri' },
                { id: 'weekends', label: 'Weekends' },
                { id: 'custom', label: 'Custom Days' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id as FrequencyType)}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    frequency === f.id
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {frequency === 'custom' && (
              <div className="flex items-center justify-between gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mt-2">
                {DAYS_OF_WEEK.map((d) => {
                  const active = customDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => handleToggleCustomDay(d.value)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time of Day & Duration Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Time
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="morning">Morning (Early Focus)</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening (Wind Down)</option>
                <option value="anytime">Anytime during day</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Duration (mins)</span>
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={targetMinutes || ''}
                onChange={(e) => setTargetMinutes(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              >
              </input>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority Focus Level
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${
                    priority === p
                      ? p === 'high'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold'
                        : p === 'medium'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold'
                        : 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p} Priority
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              {initialData ? 'Save Changes' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
