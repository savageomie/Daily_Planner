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
  userId?: string;
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

export interface CustomTask {
  id: string;
  userId?: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  completed: boolean;
  createdAt: string;
}

export type RecordsMap = Record<string, DayRecord>; // key: "YYYY-MM-DD"

export type ActiveTab = 'matrix' | 'cards' | 'day' | 'calendar' | 'analytics';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AppState {
  currentMonth: string; // "YYYY-MM"
  selectedDate: string; // "YYYY-MM-DD"
  activeTab: ActiveTab;
  selectedCategory: string; // 'all' or categoryId
  milestones: Milestone[];
  records: RecordsMap;
  tasks: CustomTask[];
  categories: Category[];
  darkMode: boolean;
}
