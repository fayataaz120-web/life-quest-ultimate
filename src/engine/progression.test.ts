/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  calculateJourneyLevel,
  calculateLifetimeRank,
  calculateTaskXp,
  getLocalDateString,
  getDaysDifference,
  getInitialStats,
  applyEvent,
  reduceEvents,
  DEFAULT_CONFIG,
} from './progression';
import { createQuestEvent } from './events';
import { registerTestMigration, unregisterTestMigration, migrateEvent } from './migrations';
import { QuestEvent } from './types';

describe('Progression Engine - Date & Time Utilities', () => {
  it('should correctly format local dates based on timezone offset and reset hour', () => {
    // 2026-07-16 02:00:00 UTC is timestamp 1784167200000
    const ts = new Date('2026-07-16T02:00:00Z').getTime();

    // 1. UTC, reset hour 0 (midnight) -> Should be 2026-07-16
    expect(getLocalDateString(ts, 0, 0)).toBe('2026-07-16');

    // 2. UTC, reset hour 4 (4 AM) -> 02:00:00 is before reset hour, should be previous day 2026-07-15
    expect(getLocalDateString(ts, 0, 4)).toBe('2026-07-15');

    // 3. Eastern Time (-300 min), reset hour 0 -> local time is 2026-07-15 21:00:00 -> Should be 2026-07-15
    expect(getLocalDateString(ts, 300, 0)).toBe('2026-07-15');
  });

  it('should correctly calculate differences in days between date strings', () => {
    expect(getDaysDifference('2026-07-15', '2026-07-16')).toBe(1);
    expect(getDaysDifference('2026-07-15', '2026-07-20')).toBe(5);
    expect(getDaysDifference('2026-07-15', '2026-07-15')).toBe(0);
  });
});

describe('Progression Engine - Leveling Curves', () => {
  it('should calculate Journey levels correctly using linear-exponential curve', () => {
    // Curve formula: level L requires: baseXp (200) + linearFactor (50) * L
    // Level 1 -> 2: 250 XP
    // Level 2 -> 3: 300 XP (cumulative 550 XP)
    // Level 3 -> 4: 350 XP (cumulative 900 XP)

    const res1 = calculateJourneyLevel(0);
    expect(res1.level).toBe(1);
    expect(res1.xp).toBe(0);
    expect(res1.xpToNextLevel).toBe(250);

    const res2 = calculateJourneyLevel(249);
    expect(res2.level).toBe(1);
    expect(res2.xp).toBe(249);

    const res3 = calculateJourneyLevel(250);
    expect(res3.level).toBe(2);
    expect(res3.xp).toBe(0);
    expect(res3.xpToNextLevel).toBe(300);

    const res4 = calculateJourneyLevel(550);
    expect(res4.level).toBe(3);
    expect(res4.xp).toBe(0);
    expect(res4.xpToNextLevel).toBe(350);

    const res5 = calculateJourneyLevel(600);
    expect(res5.level).toBe(3);
    expect(res5.xp).toBe(50);
  });

  it('should calculate Lifetime Rank correctly', () => {
    // Curve formula: requirement R to R+1 = baseXp (1000) * multiplier(1.15) ^ R
    // Rank 0 (Bronze I): 0 XP
    // Rank 1 (Bronze II): 1000 XP
    // Rank 2 (Bronze III): 1000 + 1150 = 2150 XP
    
    const r0 = calculateLifetimeRank(0);
    expect(r0.rankName).toBe('Bronze I');

    const r1 = calculateLifetimeRank(999);
    expect(r1.rankName).toBe('Bronze I');

    const r2 = calculateLifetimeRank(1000);
    expect(r2.rankName).toBe('Bronze II');

    const r3 = calculateLifetimeRank(2150);
    expect(r3.rankName).toBe('Bronze III');
  });
});

describe('Progression Engine - XP Calculations with Diminishing Returns', () => {
  it('should apply category multipliers and daily diminishing returns correctly', () => {
    const taskId = 'test-task';
    const category = 'fitness'; // multiplier is 1.1 in default config
    const difficulty = 'Moderate'; // base is 40 XP
    
    // 1st completion: 40 * 1.1 = 44 XP
    const xp1 = calculateTaskXp(taskId, category, difficulty, [], '2026-07-16');
    expect(xp1).toBe(44);

    // 2nd completion on same day: 40 * 1.1 * 0.5 = 22 XP
    const xp2 = calculateTaskXp(taskId, category, difficulty, ['2026-07-16'], '2026-07-16');
    expect(xp2).toBe(22);

    // 3rd completion on same day: 40 * 1.1 * 0.25 = 11 XP
    const xp3 = calculateTaskXp(taskId, category, difficulty, ['2026-07-16', '2026-07-16'], '2026-07-16');
    expect(xp3).toBe(11);

    // Completion on a different day: gets full 44 XP again
    const xpDiffDay = calculateTaskXp(taskId, category, difficulty, ['2026-07-15'], '2026-07-16');
    expect(xpDiffDay).toBe(44);

    // Diminishing returns should never fall below 1 XP
    const history = Array(20).fill('2026-07-16');
    const xpFloor = calculateTaskXp(taskId, category, difficulty, history, '2026-07-16');
    expect(xpFloor).toBe(1);
  });
});

describe('Progression Engine - Streak & Shields Reduction', () => {
  const config = { ...DEFAULT_CONFIG };
  const baseTime = new Date('2026-07-16T12:00:00Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  it('should increase streak on consecutive days', () => {
    const events = [
      createQuestEvent('TASK_COMPLETED', { taskId: 't1', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 1' }, baseTime),
      createQuestEvent('TASK_COMPLETED', { taskId: 't2', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 2' }, baseTime + dayMs),
      createQuestEvent('TASK_COMPLETED', { taskId: 't3', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 3' }, baseTime + 2 * dayMs),
    ];

    const stats = reduceEvents(events, config, 'Hero', 0);
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
  });

  it('should not increase streak twice on the same day', () => {
    const events = [
      createQuestEvent('TASK_COMPLETED', { taskId: 't1', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 1' }, baseTime),
      createQuestEvent('TASK_COMPLETED', { taskId: 't2', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 2' }, baseTime + 1000), // same day
    ];

    const stats = reduceEvents(events, config, 'Hero', 0);
    expect(stats.currentStreak).toBe(1);
  });

  it('should consume streak shield to protect streak on a missed day', () => {
    const events = [
      // 1. Give player 1 shield via shield change event
      createQuestEvent('SHIELD_CHANGED', { change: 1, reason: 'reward' }, baseTime - dayMs),
      // 2. Complete day 1
      createQuestEvent('TASK_COMPLETED', { taskId: 't1', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 1' }, baseTime),
      // 3. Skip day 2, complete day 3 (missed day 2)
      createQuestEvent('TASK_COMPLETED', { taskId: 't2', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 2' }, baseTime + 2 * dayMs),
    ];

    const stats = reduceEvents(events, config, 'Hero', 0);
    // Shield should be consumed
    expect(stats.shields).toBe(0);
    // Streak should be preserved and incremented to 2
    expect(stats.currentStreak).toBe(2);
  });

  it('should soft-decay streak when no shields are available', () => {
    const events = [
      // 1. Complete day 1 (streak becomes 1)
      createQuestEvent('TASK_COMPLETED', { taskId: 't1', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 1' }, baseTime),
      // 2. Complete day 2 (streak becomes 2)
      createQuestEvent('TASK_COMPLETED', { taskId: 't2', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 2' }, baseTime + dayMs),
      // 3. Skip day 3, complete day 4 (missed day 3, no shields).
      // Streak of 2 decays by 50% (rate=0.5) to 1.
      // Then the completion on day 4 increments it from 1 to 2.
      createQuestEvent('TASK_COMPLETED', { taskId: 't3', categoryId: 'fitness', difficulty: 'Easy', name: 'Task 3' }, baseTime + 3 * dayMs),
    ];

    const stats = reduceEvents(events, config, 'Hero', 0);
    expect(stats.currentStreak).toBe(2);
  });

  it('should support fixed step streak decay when configured', () => {
    const customConfig = { ...DEFAULT_CONFIG, streakDecayRate: 1.0, streakDecayStep: 5 };
    const events = [
      // 1. Complete days leading to streak of 10
      ...Array.from({ length: 10 }, (_, i) => 
        createQuestEvent('TASK_COMPLETED', { taskId: 't', categoryId: 'fitness', difficulty: 'Easy', name: 'Task' }, baseTime + i * dayMs)
      ),
      // Skip 1 day, complete next day. Missed 1 day.
      // Streak of 10 decays by 5 steps to 5.
      // Completion on the new day increments it from 5 to 6.
      createQuestEvent('TASK_COMPLETED', { taskId: 't-post', categoryId: 'fitness', difficulty: 'Easy', name: 'Task' }, baseTime + 11 * dayMs),
    ];

    const stats = reduceEvents(events, customConfig, 'Hero', 0);
    expect(stats.currentStreak).toBe(6);
  });
});

describe('Progression Engine - Rebirth & Journey Resets', () => {
  const baseTime = new Date('2026-07-16T12:00:00Z').getTime();

  it('should reset journey stats and preserve lifetime stats on Rebirth (JOURNEY_STARTED)', () => {
    const events = [
      // Gained Journey XP + Coins
      createQuestEvent('TASK_COMPLETED', { taskId: 't1', categoryId: 'fitness', difficulty: 'Hard', name: 'Task 1' }, baseTime), // +100XP
      createQuestEvent('TASK_COMPLETED', { taskId: 't2', categoryId: 'fitness', difficulty: 'Hard', name: 'Task 2' }, baseTime + 1000), // +100XP
      // Journey Rebirth starts a new journey
      createQuestEvent('JOURNEY_STARTED', { journeyNumber: 2, name: 'Path of Fire', goal: 'Get Fit' }, baseTime + 2000),
    ];

    const stats = reduceEvents(events, DEFAULT_CONFIG, 'Hero', 0);

    // Journey stats are reset
    expect(stats.level).toBe(1);
    expect(stats.xp).toBe(0);
    expect(stats.coins).toBe(0);
    expect(stats.currentStreak).toBe(0);
    
    // Lifetime stats are preserved
    expect(stats.lifetimeXp).toBe(220); // 100 * 1.1 * 2 = 220
    expect(stats.lifetimeCoins).toBe(40); // 20 * 2 = 40
    expect(stats.lifetimeRank).toBe('Bronze I');
  });
});

describe('Progression Engine - Milestone Evaluation', () => {
  it('should unlock milestone and reward the player when event is processed', () => {
    const baseTime = Date.now();
    const events = [
      createQuestEvent('MILESTONE_UNLOCKED', { milestoneId: 'ms-streak-10', name: 'Streak Legend', reward: { coins: 100, shields: 2 } }, baseTime),
    ];

    const stats = reduceEvents(events, DEFAULT_CONFIG, 'Hero', 0);
    expect(stats.unlockedMilestones).toContain('ms-streak-10');
    expect(stats.coins).toBe(100);
    expect(stats.shields).toBe(2);
    expect(stats.lifetimeCoins).toBe(100);
  });
});

describe('Progression Engine - Schema Migrations', () => {
  beforeEach(() => {
    // Register a test migration to version 2
    registerTestMigration(2, (evt: any) => {
      if (evt.eventType === 'TASK_COMPLETED') {
        evt.payload.migratedField = 'migrated_value';
      }
      return evt;
    });
  });

  afterEach(() => {
    unregisterTestMigration(2);
  });

  it('should migrate events up to the target version', () => {
    const rawEvent: QuestEvent = {
      id: 'evt-1',
      timestamp: Date.now(),
      eventType: 'TASK_COMPLETED',
      payload: { taskId: 't1', name: 'Legacy Task' },
      schemaVersion: 1,
    };

    const migrated = migrateEvent(rawEvent, 2);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.payload.migratedField).toBe('migrated_value');
    expect(migrated.payload.taskId).toBe('t1'); // verify old fields are preserved
  });
});
