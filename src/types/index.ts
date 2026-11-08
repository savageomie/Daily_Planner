export type CategoryId = 'health' | 'work' | 'learning' | 'mindfulness' | 'creative' | 'finance' | string;

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color token or hex
  accentBg: string;
  accentText: string;
  borderColor: string;
  iconName: string;
}

export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  frequency: FrequencyType;
  customDays?: number[]; // 0 (Sun) to 6 (Sat)
  timeOfDay: TimeOfDay;
  targetMonth: string; // "YYYY-MM" e.g. "2026-11"
  createdAt: string;
  targetMinutes?: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface DayRecord {
  completedMilestoneIds: string[];
  note?: string;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
}

export type RecordsMap = Record<string, DayRecord>; // key: "YYYY-MM-DD"

export type ActiveTab = 'matrix' | 'cards' | 'day' | 'calendar' | 'analytics';

export interface AppState {
  currentMonth: string; // "YYYY-MM"
  selectedDate: string; // "YYYY-MM-DD"
  activeTab: ActiveTab;
  selectedCategory: string; // 'all' or categoryId
  milestones: Milestone[];
  records: RecordsMap;
  categories: Category[];
  darkMode: boolean;
}
