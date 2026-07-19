/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  QuestEvent,
  ProgressionConfig,
  DerivedPlayerStats,
  DifficultyTier,
  SkillCategory,
} from './types';

export const RANKS_LIST = [
  'Bronze I', 'Bronze II', 'Bronze III',
  'Silver I', 'Silver II', 'Silver III',
  'Gold I', 'Gold II', 'Gold III',
  'Platinum I', 'Platinum II', 'Platinum III',
  'Diamond I', 'Diamond II', 'Diamond III',
  'Master',
  'Legend'
];

export const DEFAULT_CONFIG: ProgressionConfig = {
  difficultyXpMap: {
    Trivial: 5,
    Easy: 15,
    Moderate: 40,
    Medium: 40, // Maps Medium to Moderate
    Hard: 100,
    Epic: 250,
    Legendary: 250, // Maps Legendary to Epic
    Boss: 500,
  },
  categoryMultipliers: {
    health: 1.1,
    fitness: 1.1,
    reading: 1.0,
    knowledge: 1.0,
    creator: 1.3,
    writing: 1.1,
    programming: 1.2,
    business: 1.35,
    finance: 1.25,
    faith: 1.2,
    deen: 1.2, // Maps Deen to Faith multiplier
    'life skills': 1.0,
    languages: 1.15,
    history: 1.1,
    projects: 1.2,
    relationships: 1.0,
    career: 1.1,
  },
  diminishingDecayFactor: 0.5,
  streakShieldCostCoins: 20,
  streakDecayRate: 0.5, // Decays by 50% rounded down
  streakDecayStep: 0,   // If > 0, decays by a fixed amount of days
  dailyResetHour: 0,    // Midnight
  journeyLevelCurve: {
    baseXp: 200,
    linearFactor: 50,
  },
  lifetimeRankCurve: {
    baseXp: 1000,
    multiplier: 1.15,
  },
};

/**
 * Get date string (YYYY-MM-DD) adjusted for timezone offset and daily reset hour.
 */
export function getLocalDateString(
  timestamp: number,
  timezoneOffsetMin: number = 0,
  dailyResetHour: number = 0
): string {
  // Convert offset (minutes) and reset hour (hours) to milliseconds and subtract them.
  // Standard Javascript Date.getTimezoneOffset() returns positive minutes for time zones behind UTC.
  // So: AdjustedTime = UTC_Time - (TimezoneOffsetMinutes * 60 * 1000) - (ResetHour * 60 * 60 * 1000)
  const adjustedMs = timestamp - timezoneOffsetMin * 60 * 1000 - dailyResetHour * 60 * 60 * 1000;
  const date = new Date(adjustedMs);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculate difference in days between two YYYY-MM-DD date strings.
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00Z');
  const d2 = new Date(date2 + 'T00:00:00Z');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate Journey Level and remaining XP based on the linear-exponential curve.
 */
export function calculateJourneyLevel(
  xp: number,
  config: ProgressionConfig = DEFAULT_CONFIG
): { level: number; xp: number; xpToNextLevel: number } {
  let level = 1;
  let xpRemaining = xp;
  while (true) {
    const required = config.journeyLevelCurve.baseXp + config.journeyLevelCurve.linearFactor * level;
    if (xpRemaining >= required) {
      xpRemaining -= required;
      level++;
    } else {
      break;
    }
  }
  const requiredForNext = config.journeyLevelCurve.baseXp + config.journeyLevelCurve.linearFactor * level;
  return {
    level,
    xp: xpRemaining,
    xpToNextLevel: requiredForNext,
  };
}

/**
 * Calculate Lifetime Rank and rank index from lifetime XP.
 */
export function calculateLifetimeRank(
  lifetimeXp: number,
  config: ProgressionConfig = DEFAULT_CONFIG
): { rankName: string; rankIndex: number } {
  let rankIndex = 0;
  let currentThreshold = 0;
  while (rankIndex < RANKS_LIST.length - 1) {
    const req = Math.floor(config.lifetimeRankCurve.baseXp * Math.pow(config.lifetimeRankCurve.multiplier, rankIndex));
    if (lifetimeXp >= currentThreshold + req) {
      currentThreshold += req;
      rankIndex++;
    } else {
      break;
    }
  }
  return {
    rankName: RANKS_LIST[rankIndex],
    rankIndex,
  };
}

/**
 * Calculate XP Reward for a task completion, considering daily diminishing returns.
 */
export function calculateTaskXp(
  taskId: string,
  categoryId: string,
  difficulty: DifficultyTier,
  completionDates: string[],
  currentDateStr: string,
  config: ProgressionConfig = DEFAULT_CONFIG
): number {
  const baseValue = config.difficultyXpMap[difficulty] ?? 15;
  const multiplier = config.categoryMultipliers[categoryId.toLowerCase()] ?? 1.0;
  
  // Count how many times this task was completed on the current date previously
  const todayCompletions = completionDates.filter(d => d === currentDateStr).length;
  
  // Diminishing returns: BaseXP * Multiplier * (diminishingDecayFactor ^ todayCompletions)
  const decayExponent = todayCompletions;
  const rawXp = baseValue * multiplier * Math.pow(config.diminishingDecayFactor, decayExponent);
  
  // Ensure we always return at least 1 XP
  return Math.max(1, Math.round(rawXp));
}

/**
 * Create initial DerivedPlayerStats state.
 */
export function getInitialStats(playerName: string = 'Hero'): DerivedPlayerStats {
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: DEFAULT_CONFIG.journeyLevelCurve.baseXp + DEFAULT_CONFIG.journeyLevelCurve.linearFactor,
    coins: 0,
    currentStreak: 0,
    longestStreak: 0,
    shields: 0,
    lifetimeXp: 0,
    lifetimeCoins: 0,
    lifetimeRank: RANKS_LIST[0],
    categoryTaskCounts: {},
    completedTasks: {},
    completedQuests: {},
    unlockedMilestones: [],
    timeline: [],
  };
}

/**
 * Recompute DerivedPlayerStats by applying a single QuestEvent to the current state.
 */
export function applyEvent(
  state: DerivedPlayerStats,
  event: QuestEvent,
  config: ProgressionConfig = DEFAULT_CONFIG,
  timezoneOffsetMin: number = 0
): DerivedPlayerStats {
  // Deep clone state to ensure immutability
  const nextState = JSON.parse(JSON.stringify(state)) as DerivedPlayerStats;
  const eventDateStr = getLocalDateString(event.timestamp, timezoneOffsetMin, config.dailyResetHour);

  // Helper to process streak update on any action completion
  const recordActivityDate = (dateStr: string) => {
    if (!nextState.lastActiveDate) {
      nextState.currentStreak = 1;
      nextState.lastActiveDate = dateStr;
    } else {
      const diff = getDaysDifference(nextState.lastActiveDate, dateStr);
      if (diff === 1) {
        // Consecutive day
        nextState.currentStreak++;
        nextState.lastActiveDate = dateStr;
      } else if (diff > 1) {
        // Missed days! Check shields
        const missedDays = diff - 1;
        for (let i = 0; i < missedDays; i++) {
          if (nextState.shields > 0) {
            nextState.shields--;
            // Shield protects streak, keep it alive
          } else {
            // No shield, decay streak
            if (config.streakDecayStep > 0) {
              nextState.currentStreak = Math.max(0, nextState.currentStreak - config.streakDecayStep);
            } else {
              nextState.currentStreak = Math.floor(nextState.currentStreak * config.streakDecayRate);
            }
          }
        }
        
        // After shielding/decay, this new day completion resumes the streak
        if (nextState.currentStreak === 0) {
          nextState.currentStreak = 1;
        } else {
          nextState.currentStreak++;
        }
        nextState.lastActiveDate = dateStr;
      }
      // If diff === 0, same day, do nothing to currentStreak
    }
    nextState.longestStreak = Math.max(nextState.longestStreak, nextState.currentStreak);
  };

  switch (event.eventType) {
    case 'TASK_COMPLETED': {
      const { taskId, categoryId, difficulty, name } = event.payload;
      
      // Get previous completion dates for this task
      const prevTaskData = nextState.completedTasks[taskId] || { dates: [], count: 0 };
      
      // Calculate XP
      const xpGained = calculateTaskXp(
        taskId,
        categoryId,
        difficulty,
        prevTaskData.dates,
        eventDateStr,
        config
      );
      
      // Calculate Coins: Trivial=1, Easy=3, Moderate=8, Hard=20, Epic=50
      let baseCoins = 5;
      if (difficulty === 'Trivial') baseCoins = 1;
      else if (difficulty === 'Easy') baseCoins = 3;
      else if (difficulty === 'Moderate' || difficulty === 'Medium') baseCoins = 8;
      else if (difficulty === 'Hard') baseCoins = 20;
      else if (difficulty === 'Epic' || difficulty === 'Legendary') baseCoins = 50;
      else if (difficulty === 'Boss') baseCoins = 100;
      
      const coinsGained = baseCoins;

      // Update task completion metadata
      nextState.completedTasks[taskId] = {
        dates: [...prevTaskData.dates, eventDateStr],
        count: prevTaskData.count + 1,
      };

      // Update category task count
      const catKey = categoryId.toLowerCase();
      nextState.categoryTaskCounts[catKey] = (nextState.categoryTaskCounts[catKey] || 0) + 1;

      // Update XP & Level
      nextState.xp += xpGained;
      nextState.lifetimeXp += xpGained;
      
      const levelSnapshot = calculateJourneyLevel(nextState.xp, config);
      if (levelSnapshot.level > nextState.level) {
        nextState.timeline.push({
          timestamp: event.timestamp,
          type: 'LEVEL_UP',
          description: `Reached Journey Level ${levelSnapshot.level}!`,
        });
      }
      nextState.level = levelSnapshot.level;
      nextState.xp = levelSnapshot.xp;
      nextState.xpToNextLevel = levelSnapshot.xpToNextLevel;

      // Update Coins
      nextState.coins += coinsGained;
      nextState.lifetimeCoins += coinsGained;

      // Record date for streak
      recordActivityDate(eventDateStr);

      nextState.timeline.push({
        timestamp: event.timestamp,
        type: 'TASK_COMPLETED',
        description: `Completed task: "${name}" (+${xpGained} XP, +${coinsGained} Coins)`,
      });
      break;
    }

    case 'QUEST_COMPLETED': {
      const { questId, name, difficulty } = event.payload;
      
      const prevQuestData = nextState.completedQuests[questId] || { dates: [], count: 0 };
      
      // Quests give flat high rewards
      let xpGained = 50;
      let coinsGained = 15;
      if (difficulty === 'Easy') { xpGained = 30; coinsGained = 10; }
      else if (difficulty === 'Hard') { xpGained = 120; coinsGained = 40; }
      else if (difficulty === 'Epic' || difficulty === 'Legendary') { xpGained = 250; coinsGained = 80; }
      else if (difficulty === 'Boss') { xpGained = 500; coinsGained = 150; }

      nextState.completedQuests[questId] = {
        dates: [...prevQuestData.dates, eventDateStr],
        count: prevQuestData.count + 1,
      };

      nextState.xp += xpGained;
      nextState.lifetimeXp += xpGained;

      const levelSnapshot = calculateJourneyLevel(nextState.xp, config);
      nextState.level = levelSnapshot.level;
      nextState.xp = levelSnapshot.xp;
      nextState.xpToNextLevel = levelSnapshot.xpToNextLevel;

      nextState.coins += coinsGained;
      nextState.lifetimeCoins += coinsGained;

      recordActivityDate(eventDateStr);

      nextState.timeline.push({
        timestamp: event.timestamp,
        type: 'QUEST_COMPLETED',
        description: `Completed quest: "${name}" (+${xpGained} XP, +${coinsGained} Coins)`,
      });
      break;
    }

    case 'SHIELD_CHANGED': {
      const { change, reason } = event.payload;
      nextState.shields = Math.max(0, nextState.shields + change);
      nextState.timeline.push({
        timestamp: event.timestamp,
        type: 'SHIELD_CHANGED',
        description: `Streak Shield(s) ${change > 0 ? 'added' : 'consumed'} (${reason}): ${Math.abs(change)} shield(s)`,
      });
      break;
    }

    case 'COINS_SPENT': {
      const { itemId, name, cost } = event.payload;
      if (nextState.coins >= cost) {
        nextState.coins -= cost;
        if (itemId === 'streak_shield') {
          nextState.shields++;
        }
        nextState.timeline.push({
          timestamp: event.timestamp,
          type: 'COINS_SPENT',
          description: `Purchased "${name}" from Shop for ${cost} Coins`,
        });
      }
      break;
    }

    case 'JOURNEY_STARTED': {
      const { journeyNumber, name } = event.payload;
      // Reset Journey stats
      nextState.level = 1;
      nextState.xp = 0;
      nextState.xpToNextLevel = config.journeyLevelCurve.baseXp + config.journeyLevelCurve.linearFactor;
      nextState.coins = 0;
      nextState.currentStreak = 0;
      nextState.lastActiveDate = undefined;
      nextState.shields = 0;
      
      nextState.timeline.push({
        timestamp: event.timestamp,
        type: 'JOURNEY_STARTED',
        description: `Journey #${journeyNumber} "${name}" began!`,
      });
      break;
    }

    case 'JOURNEY_COMPLETED': {
      const { journeyNumber, name } = event.payload;
      nextState.timeline.push({
        timestamp: event.timestamp,
        type: 'JOURNEY_COMPLETED',
        description: `Journey #${journeyNumber} "${name}" completed and archived. Ready for Rebirth!`,
      });
      break;
    }

    case 'MILESTONE_UNLOCKED': {
      const { milestoneId, name, reward } = event.payload;
      if (!nextState.unlockedMilestones.includes(milestoneId)) {
        nextState.unlockedMilestones.push(milestoneId);
        if (reward?.coins) {
          nextState.coins += reward.coins;
          nextState.lifetimeCoins += reward.coins;
        }
        if (reward?.shields) {
          nextState.shields += reward.shields;
        }
        nextState.timeline.push({
          timestamp: event.timestamp,
          type: 'MILESTONE_UNLOCKED',
          description: `Milestone Achieved: "${name}"!`,
        });
      }
      break;
    }

    case 'MANUAL_XP_ADJUST': {
      const { xpAmount, coinAmount, reason } = event.payload;
      nextState.xp = Math.max(0, nextState.xp + xpAmount);
      nextState.lifetimeXp = Math.max(0, nextState.lifetimeXp + xpAmount);
      
      const levelSnapshot = calculateJourneyLevel(nextState.xp, config);
      nextState.level = levelSnapshot.level;
      nextState.xp = levelSnapshot.xp;
      nextState.xpToNextLevel = levelSnapshot.xpToNextLevel;

      nextState.coins = Math.max(0, nextState.coins + coinAmount);
      nextState.lifetimeCoins = Math.max(0, nextState.lifetimeCoins + coinAmount);

      nextState.timeline.push({
        timestamp: event.timestamp,
        type: 'MANUAL_XP_ADJUST',
        description: `Manual adjustment (${reason}): ${xpAmount >= 0 ? '+' : ''}${xpAmount} XP, ${coinAmount >= 0 ? '+' : ''}${coinAmount} Coins`,
      });
      break;
    }

    case 'STREAK_CHANGED': {
      const { oldStreak, newStreak, reason } = event.payload;
      nextState.currentStreak = newStreak;
      nextState.longestStreak = Math.max(nextState.longestStreak, newStreak);
      nextState.timeline.push({
        timestamp: event.timestamp,
        type: 'STREAK_CHANGED',
        description: `Streak updated to ${newStreak} (${reason})`,
      });
      break;
    }
  }

  // Always compute lifetime rank based on lifetime XP
  const rankSnapshot = calculateLifetimeRank(nextState.lifetimeXp, config);
  nextState.lifetimeRank = rankSnapshot.rankName;

  return nextState;
}

/**
 * Recomputes player stats from scratch using the full chronological event log.
 */
export function reduceEvents(
  events: QuestEvent[],
  config: ProgressionConfig = DEFAULT_CONFIG,
  playerName: string = 'Hero',
  timezoneOffsetMin: number = 0
): DerivedPlayerStats {
  // Sort events chronologically to ensure correct sequence of leveling & streak logic
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
  
  let state = getInitialStats(playerName);
  for (const event of sortedEvents) {
    state = applyEvent(state, event, config, timezoneOffsetMin);
  }
  return state;
}
