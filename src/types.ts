/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayerClass = 'Warrior' | 'Mage' | 'Rogue' | 'Cleric' | 'Alchemist';

export interface PlayerProfile {
  name: string;
  class: PlayerClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  title: string;
  rank: string;
  currentStreak: number;
  longestStreak: number;
  prestige: number;
  unlockedTitles: string[];
  journeyStartDate?: string;
  equippedAvatarId?: 'djinn' | 'celestial' | 'cosmic';
  timeZone?: string;
  dailyResetTime?: string;
  mainGoal?: string;
  companionId?: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  xpMultiplier: number;
  color: string; // Tailwind color class representation
}

export type DifficultyLevel = 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Legendary';
export type FrequencyType = 'Daily' | 'Weekly' | 'Monthly' | 'One-time';

export interface Activity {
  id: string;
  categoryId: string;
  name: string;
  status: 'Active' | 'Completed' | 'Paused' | 'Archived';
  priority: 'Low' | 'Medium' | 'High';
  difficulty: DifficultyLevel;
  frequency: FrequencyType;
  xpReward: number;
  coinsReward: number;
  startedDate: string;
  completedTimes: number;
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  notes: string;
}

export type QuestType = 'Daily' | 'Weekly' | 'Monthly' | 'Boss' | 'Legendary';

export interface Quest {
  id: string;
  name: string;
  type: QuestType;
  description: string;
  difficulty: DifficultyLevel;
  xpReward: number;
  coinsReward: number;
  completed: boolean;
  dateAdded: string;
  completedDate?: string;
  categoryId?: string; // Optional links to category
}

export interface RoadmapItem {
  id: string;
  phase: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  status: 'Not Started' | 'In Progress' | 'Completed';
  xpReward: number;
  coinsReward: number;
  dateAdded: string;
  completedDate?: string;
  categoryId?: string;
  targetDate?: string;
}


export interface SkillNode {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  tier: number;
  icon: string;
  prerequisites: string[]; // Skill IDs that must be unlocked
  effects: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
  purchaseCount: number;
  custom: boolean;
}

// Long term database types
export interface BookLog {
  id: string;
  title: string;
  author: string;
  status: 'Reading' | 'Completed' | 'To Read';
  progress: number; // percentage or current page
  pages: number;
  rating?: number;
  review?: string;
  dateLogged: string;
}

export interface VideoLog {
  id: string;
  title: string;
  creator: string;
  category: string;
  durationMin: number;
  watched: boolean;
  dateLogged: string;
}

export interface CourseLog {
  id: string;
  name: string;
  provider: string;
  progress: number;
  certificatesUrl?: string;
  completed: boolean;
  dateLogged: string;
}

export interface FitnessLog {
  id: string;
  activity: string; // e.g., Run, Lift, Swim, Yoga
  metric: string;   // e.g., "5km", "Bench 80kg"
  value: number;    // generic numerical value
  durationMin: number;
  dateLogged: string;
}

export interface JournalLog {
  id: string;
  title: string;
  content: string;
  mood: string;
  dateLogged: string;
}

export interface ProjectLog {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Shipped';
  xpEarned: number;
  dateLogged: string;
}

export interface DreamLog {
  id: string;
  description: string;
  lucidity: number; // 1-10
  tags: string[];
  dateLogged: string;
}

export interface BusinessIdeaLog {
  id: string;
  title: string;
  problem: string;
  solution: string;
  marketSize?: string;
  viability: number; // 1-10
  dateLogged: string;
}

export interface VocabularyLog {
  id: string;
  word: string;
  definition: string;
  language: string;
  learned: boolean;
  dateLogged: string;
}

export interface TravelLog {
  id: string;
  destination: string;
  notes: string;
  completed: boolean;
  dateLogged: string;
}

export interface QuoteLog {
  id: string;
  text: string;
  author: string;
  source?: string;
  category?: string;
  dateLogged: string;
}

export interface Companion {
  id: string;
  name: string;
  biography: string;
  role: string;
  personality: string;
  voice: string;
  quotes: { [emotion: string]: string[] };
  greeting: string;
  celebration: string;
  thinking: string;
  sleeping: string;
  meditating: string;
  colorTheme: {
    primary: string; // Tailwind class for text or bg
    secondary: string;
    glow: string; // hex color for shadow
    accent: string;
  };
  visualEffects: string[]; // ['floating_runes', 'magic_circles', 'floating_particles', 'aurora_pulse']
  background: string; // HQ name
  music: string; // ambient name
  isCustom?: boolean;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  xpGained: number;
  coinsGained: number;
  completedCount: number;
}

export interface JourneyHistoryEntry {
  id: string;
  number: number;
  name: string;
  startDate: string;
  endDate?: string;
  highestLevel: number;
  highestXp: number;
  longestStreak: number;
  booksRead: number;
  languagesLearned: string[];
  achievementsCount: number;
  completionPercentage: number;
  status: 'Active' | 'Paused' | 'Archived';
  stateSnapshot: string; // JSON snapshot of the journey's state
}

export interface JourneyStats {
  questsCompleted: number;
  activitiesCompleted: number;
  wordsLearned: number;
  skillsUnlocked: number;
  booksRead: number;
}

export interface LifetimeStats {
  totalQuestsCompleted: number;
  totalActivitiesCompleted: number;
  totalJourneysCompleted: number;
  totalWordsLearned: number;
  totalSkillsUnlocked: number;
  totalDaysActive: number;
}

export interface AppState {
  player: PlayerProfile;
  categories: Category[];
  activities: Activity[];
  quests: Quest[];
  skills: SkillNode[];
  rewards: ShopItem[];
  bookLogs: BookLog[];
  videoLogs: VideoLog[];
  courseLogs: CourseLog[];
  fitnessLogs: FitnessLog[];
  journalLogs: JournalLog[];
  projectLogs: ProjectLog[];
  dreamLogs: DreamLog[];
  businessIdeaLogs: BusinessIdeaLog[];
  vocabularyLogs: VocabularyLog[];
  travelLogs: TravelLog[];
  quoteLogs: QuoteLog[];
  history: HistoryEntry[];
  equippedCompanionId?: string | null;
  hideCompanion?: boolean;
  companionSize?: 'sm' | 'md' | 'lg';
  companionPositionX?: number;
  companionPositionY?: number;
  companionPositionMode?: 'Left' | 'Right' | 'Bottom' | 'Floating' | 'Auto';
  companionScale?: number;
  companionRenderingMode?: 'vector' | 'sprite' | '3d';
  favoriteCompanionIds?: string[];
  archivedCompanionIds?: string[];
  unlockedCompanionIds?: string[];
  customCompanions?: Companion[];
  headquartersTheme?: string;

  // Journey System Core Properties
  journeyStatus: 'Active' | 'Paused' | 'Archived';
  journeyNumber: number;
  journeyName: string;
  journeyStartDate: string;
  journeyEndDate?: string;
  journeyAchievements: string[];
  journeyStatistics: JourneyStats;
  decayEnabled?: boolean;
  decayDifficulty?: 'Easy' | 'Normal' | 'Hard' | 'Legend';
  lastActiveDate?: string;
  mainGoal?: string;

  // Lifetime Legacy Core Properties
  lifetimeXp: number;
  lifetimeCoins: number;
  lifetimeBooks: number;
  lifetimeAchievements: string[];
  legacyBadges: string[];
  journeyHistory: JourneyHistoryEntry[];
  lifetimeStatistics: LifetimeStats;
  roadmap?: RoadmapItem[];
}

