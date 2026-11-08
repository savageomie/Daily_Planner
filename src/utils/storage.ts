import { Category, Milestone, RecordsMap, AppState } from '../types';
import { getTodayDateString, getCurrentMonthString } from './dateUtils';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'health',
    name: 'Health & Vitality',
    color: '#10b981', // emerald-500
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
    iconName: 'Activity',
  },
  {
    id: 'work',
    name: 'Deep Focus & Career',
    color: '#6366f1', // indigo-500
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    accentText: 'text-indigo-700 dark:text-indigo-400',
    borderColor: 'border-indigo-300 dark:border-indigo-800',
    iconName: 'Zap',
  },
  {
    id: 'learning',
    name: 'Knowledge & Growth',
    color: '#f59e0b', // amber-500
    accentBg: 'bg-amber-50 dark:bg-amber-950/40',
    accentText: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-300 dark:border-amber-800',
    iconName: 'BookOpen',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness & Rest',
    color: '#06b6d4', // cyan-500
    accentBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    accentText: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-cyan-300 dark:border-cyan-800',
    iconName: 'Compass',
  },
  {
    id: 'creative',
    name: 'Creative Craft',
    color: '#ec4899', // pink/rose-500
    accentBg: 'bg-pink-50 dark:bg-pink-950/40',
    accentText: 'text-pink-700 dark:text-pink-400',
    borderColor: 'border-pink-300 dark:border-pink-800',
    iconName: 'Sparkles',
  },
];

export function getInitialMilestones(monthStr: string): Milestone[] {
  return [
    {
      id: 'm1',
      title: '30-min Workout or Run',
      description: 'Cardio, strength session, or brisk outdoor run',
      categoryId: 'health',
      frequency: 'daily',
      timeOfDay: 'morning',
      targetMonth: monthStr,
      createdAt: `${monthStr}-01T08:00:00Z`,
      targetMinutes: 30,
      priority: 'high',
    },
    {
      id: 'm2',
      title: 'Deep Work Block (90 mins)',
      description: 'Zero distractions, phone in focus mode',
      categoryId: 'work',
      frequency: 'weekdays',
      timeOfDay: 'morning',
      targetMonth: monthStr,
      createdAt: `${monthStr}-01T08:00:00Z`,
      targetMinutes: 90,
      priority: 'high',
    },
    {
      id: 'm3',
      title: 'Read 20+ Pages of Book',
      description: 'Non-fiction, architecture, or industry literature',
      categoryId: 'learning',
      frequency: 'daily',
      timeOfDay: 'evening',
      targetMonth: monthStr,
      createdAt: `${monthStr}-01T08:00:00Z`,
      targetMinutes: 25,
      priority: 'medium',
    },
    {
      id: 'm4',
      title: 'Drink 2.5L Water & Clean Fuel',
      description: 'Proper hydration, no junk foods or midnight snacking',
      categoryId: 'health',
      frequency: 'daily',
      timeOfDay: 'anytime',
      targetMonth: monthStr,
      createdAt: `${monthStr}-01T08:00:00Z`,
      priority: 'medium',
    },
    {
      id: 'm5',
      title: 'Night Reflection & Next-Day Plan',
      description: '10 mins to write daily journal and set top 3 priorities',
      categoryId: 'mindfulness',
      frequency: 'daily',
      timeOfDay: 'evening',
      targetMonth: monthStr,
      createdAt: `${monthStr}-01T08:00:00Z`,
      targetMinutes: 15,
      priority: 'low',
    },
    {
      id: 'm6',
      title: 'Build & Ship Feature (Side Project)',
      description: 'Work on personal coding project or creative product',
      categoryId: 'creative',
      frequency: 'weekdays',
      timeOfDay: 'afternoon',
      targetMonth: monthStr,
      createdAt: `${monthStr}-01T08:00:00Z`,
      targetMinutes: 45,
      priority: 'medium',
    },
  ];
}

export function getInitialRecords(monthStr: string): RecordsMap {
  const records: RecordsMap = {};
  
  // Create sample entries for the first 6 days of the month to give immediate visual payoff
  const sampleData: Record<number, { completed: string[]; note?: string; energy?: 1 | 2 | 3 | 4 | 5 }> = {
    1: { completed: ['m1', 'm3', 'm4', 'm5'], note: 'Great start to the month! Re-energized and focused.', energy: 4 },
    2: { completed: ['m1', 'm2', 'm3', 'm4', 'm6'], note: 'Crushed the deep work session on architecture refactoring.', energy: 5 },
    3: { completed: ['m1', 'm2', 'm4', 'm5'], note: 'Felt tired in the evening but completed workouts.', energy: 3 },
    4: { completed: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'], note: 'Perfect streak day! 100% completion.', energy: 5 },
    5: { completed: ['m1', 'm2', 'm4', 'm6'], note: 'Pushed code commit and maintained hydration.', energy: 4 },
    6: { completed: ['m1', 'm2'], note: 'Current day in progress — morning routines done.', energy: 4 },
  };

  Object.entries(sampleData).forEach(([dayNum, data]) => {
    const dayStr = String(dayNum).padStart(2, '0');
    const fullDate = `${monthStr}-${dayStr}`;
    records[fullDate] = {
      completedMilestoneIds: data.completed,
      note: data.note,
      energyLevel: data.energy,
    };
  });

  return records;
}

const STORAGE_KEY = 'horizon_goals_manager_state_v1';

export function loadStoredState(): Partial<AppState> | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (err) {
    console.error('Failed to load state from localStorage', err);
    return null;
  }
}

export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function getInitialAppState(): AppState {
  const currentMonth = getCurrentMonthString();
  const today = getTodayDateString();

  const saved = loadStoredState();

  if (saved && saved.milestones && saved.milestones.length > 0) {
    return {
      currentMonth: saved.currentMonth || currentMonth,
      selectedDate: saved.selectedDate || today,
      activeTab: saved.activeTab || 'matrix',
      selectedCategory: saved.selectedCategory || 'all',
      milestones: saved.milestones,
      records: saved.records || {},
      categories: saved.categories || DEFAULT_CATEGORIES,
      darkMode: saved.darkMode ?? false,
    };
  }

  // Fallback to fresh initial state with rich sample data
  return {
    currentMonth,
    selectedDate: today,
    activeTab: 'matrix',
    selectedCategory: 'all',
    milestones: getInitialMilestones(currentMonth),
    records: getInitialRecords(currentMonth),
    categories: DEFAULT_CATEGORIES,
    darkMode: false,
  };
}
