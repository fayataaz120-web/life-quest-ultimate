/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarCell, ScheduledQuest } from '../types/calendar';

/**
 * Formats year, month, and day into a YYYY-MM-DD string.
 */
export const formatDateStr = (y: number, m: number, d: number): string => {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
};

/**
 * Calculates absolute days difference between two YYYY-MM-DD date strings.
 */
export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1 + 'T00:00:00Z');
  const d2 = new Date(date2 + 'T00:00:00Z');
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Generates cells representing the monthly calendar grid, including padding.
 */
export const getCalendarCells = (year: number, month: number): CalendarCell[] => {
  const cells: CalendarCell[] = [];

  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // 1. Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({
      dateStr: formatDateStr(prevYear, prevMonth, d),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dateStr: formatDateStr(year, month, d),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // 3. Next month padding to round up to full week lines
  const totalCells = Math.ceil(cells.length / 7) * 7;
  const nextMonthPadding = totalCells - cells.length;
  for (let d = 1; d <= nextMonthPadding; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    cells.push({
      dateStr: formatDateStr(nextYear, nextMonth, d),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  return cells;
};

/**
 * Persistence helpers for local storage scheduled quests.
 */
const STORAGE_KEY = 'life_quest_scheduled_quests';

export const loadScheduledQuests = (): Record<string, ScheduledQuest[]> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveScheduledQuests = (quests: Record<string, ScheduledQuest[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
  } catch (e) {
    console.error('Failed to write scheduled quests to local storage', e);
  }
};

/**
 * Computes XP and Coin rewards for scheduled quests.
 */
export const calculateQuestRewards = (
  difficulty: ScheduledQuest['difficulty'],
  categoryMultiplier: number = 1.0
): { xp: number; coins: number } => {
  let baseXp = 15;
  let coins = 3;

  if (difficulty === 'Trivial') {
    baseXp = 5;
    coins = 1;
  } else if (difficulty === 'Medium') {
    baseXp = 40;
    coins = 8;
  } else if (difficulty === 'Hard') {
    baseXp = 100;
    coins = 20;
  } else if (difficulty === 'Legendary') {
    baseXp = 250;
    coins = 50;
  }

  return {
    xp: Math.round(baseXp * categoryMultiplier),
    coins,
  };
};

/**
 * Selects an appropriate dialogue narrative from the equipped companion based on day performance.
 */
export const getCompanionDayMessage = (
  dateStr: string,
  history: { date: string; xpGained: number }[],
  companionName: string
): string => {
  const entry = history.find((h) => h.date === dateStr);
  const xp = entry?.xpGained || 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const isFuture = getDaysDifference(todayStr, dateStr) > 0;

  if (isFuture) {
    return `A blank canvas of potential, Adventurer. Inscribe your quests here, and let us prepare our strategic vectors to conquer them!`;
  }

  if (xp === 0) {
    return `A quiet day in the tavern of life. Remember, rest is just as important as the campaign itself. Re-charge your batteries, and let's strike tomorrow!`;
  } else if (xp < 50) {
    return `Steady progress, Friend! We logged ${xp} Experience points on this day. Each step, no matter how small, carves your path to absolute victory.`;
  } else if (xp < 120) {
    return `Magnificent consistency! A gain of ${xp} XP represents pure discipline and active focus. You are refining your habits beautifully.`;
  } else {
    return `A day of absolute LEGEND! You generated a staggering ${xp} Experience points! Procrastination was completely obliterated! Highly efficient work!`;
  }
};
