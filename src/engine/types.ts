/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestEventType =
  | 'TASK_COMPLETED'        // completed a task / activity
  | 'QUEST_COMPLETED'       // completed a daily/weekly/monthly quest
  | 'MILESTONE_UNLOCKED'    // unlocked a milestone
  | 'STREAK_CHANGED'        // streak updated (shield used, soft-decay, etc.)
  | 'LEVEL_UP'              // level/rank level increased
  | 'JOURNEY_STARTED'       // new journey initialized
  | 'JOURNEY_COMPLETED'     // journey reborn/archived
  | 'COINS_SPENT'           // spent coins in shop
  | 'MANUAL_XP_ADJUST'      // manual admin adjustment of XP/coins
  | 'SHIELD_CHANGED';       // shields added or consumed

export interface QuestEvent {
  id: string;               // unique UUID for this event
  timestamp: number;        // epoch timestamp in milliseconds
  eventType: QuestEventType;
  payload: any;             // event-specific details
  schemaVersion: number;    // starting at 1
}

export type SkillCategory =
  | 'Health'
  | 'Reading'
  | 'Knowledge'
  | 'Fitness'
  | 'Creator'
  | 'Writing'
  | 'Programming'
  | 'Business'
  | 'Finance'
  | 'Faith'
  | 'Deen' // Maps to Faith
  | 'Life Skills'
  | 'Languages'
  | 'History'
  | 'Projects'
  | 'Relationships'
  | 'Career';

export type DifficultyTier =
  | 'Trivial'
  | 'Easy'
  | 'Moderate'
  | 'Medium' // Maps to Moderate
  | 'Hard'
  | 'Epic'
  | 'Legendary' // Maps to Epic
  | 'Boss';

export interface ProgressionConfig {
  difficultyXpMap: Record<DifficultyTier, number>;
  categoryMultipliers: Record<string, number>;
  diminishingDecayFactor: number; // Decay multiplier for daily recurring tasks (e.g. 0.5)
  streakShieldCostCoins: number;   // Cost of shield token
  streakDecayRate: number;        // Halving factor (e.g., 0.5 = lose 50% streak days on decay)
  streakDecayStep: number;        // Lose fixed days (e.g. 1) on decay. If 0, rate is used.
  dailyResetHour: number;         // 0-23 (daily reset hour)
  journeyLevelCurve: {
    baseXp: number;               // Base XP required for level 1
    linearFactor: number;         // Linear increase per level
  };
  lifetimeRankCurve: {
    baseXp: number;
    multiplier: number;
  };
}

export interface DerivedPlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  shields: number;
  lastActiveDate?: string; // YYYY-MM-DD in timezone
  lifetimeXp: number;
  lifetimeCoins: number;
  lifetimeRank: string;
  categoryTaskCounts: Record<string, number>; // categoryId -> completion count
  completedTasks: Record<string, { dates: string[]; count: number }>; // taskId -> completion logs
  completedQuests: Record<string, { dates: string[]; count: number }>; // questId -> completion logs
  unlockedMilestones: string[]; // List of unlocked milestone IDs
  timeline: { timestamp: number; type: string; description: string }[];
}
