import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../types';
import { IconRenderer } from './IconRenderer';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
}

const AVAILABLE_COLORS = [
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-800' },
  { name: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-800' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-800' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-800' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-300 dark:border-rose-800' },
  { name: 'Violet', hex: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-300 dark:border-violet-800' },
  { name: 'Teal', hex: '#14b8a6', bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-300 dark:border-teal-800' },
  { name: 'Orange', hex: '#f97316', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-800' },
];

const AVAILABLE_ICONS = [
  'Activity', 'Zap', 'BookOpen', 'Compass', 'Sparkles', 
  'Target', 'Heart', 'Code', 'Coffee', 'Dumbbell', 'Layers', 'Award'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('Target');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      color: selectedColor.hex,
      accentBg: selectedColor.bg,
      accentText: selectedColor.text,
      borderColor: selectedColor.border,
      iconName: selectedIcon,
    };

    onSave(newCategory);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Create Custom Category
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Skill Acquisition, Language, Finance"
              required
              autoFocus
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Accent
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                    selectedColor.hex === col.hex
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/40 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="truncate text-slate-700 dark:text-slate-300">{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2.5 flex items-center justify-center rounded-lg border transition-all ${
                    selectedIcon === icon
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconRenderer name={icon} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5">Preview</span>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${selectedColor.bg} ${selectedColor.text} ${selectedColor.border}`}>
              <IconRenderer name={selectedIcon} className="w-3.5 h-3.5" />
              <span>{name || 'Category Name'}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
