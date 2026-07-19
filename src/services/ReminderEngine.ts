/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dispatchNotification } from './NotificationService';

export interface ReminderItem {
  id: string;
  name: string;
  category: 'Study' | 'Workout' | 'Prayer' | 'Reading' | 'Language Practice' | 'Projects' | 'Custom';
  time: string; // "HH:MM"
  days: number[]; // Days of week: 0 = Sun, 1 = Mon...
  enabled: boolean;
  lastTriggeredDate?: string; // YYYY-MM-DD to prevent double firing
}

const REMINDERS_KEY = 'life_quest_reminders';

export const loadReminders = (): ReminderItem[] => {
  try {
    const saved = localStorage.getItem(REMINDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}

  // Defaults
  return [
    { id: 'rem-1', name: 'Prayer Focus', category: 'Prayer', time: '13:00', days: [0, 1, 2, 3, 4, 5, 6], enabled: true },
    { id: 'rem-2', name: 'Language Practice', category: 'Language Practice', time: '17:00', days: [1, 2, 3, 4, 5], enabled: true },
    { id: 'rem-3', name: 'Iron Workout', category: 'Workout', time: '19:00', days: [1, 3, 5], enabled: true },
    { id: 'rem-4', name: 'Grimoire Reading', category: 'Reading', time: '21:00', days: [0, 1, 2, 3, 4, 5, 6], enabled: true },
  ];
};

export const saveReminders = (list: ReminderItem[]) => {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save reminders:', e);
  }
};

// Check and trigger active reminders
export const checkReminders = () => {
  const reminders = loadReminders();
  const now = new Date();
  const todayStr = now.toDateString(); // e.g. "Sun Jul 19 2026"
  const currentDay = now.getDay();
  
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMin = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHour}:${currentMin}`;

  let updated = false;

  const modifiedReminders = reminders.map((rem) => {
    if (!rem.enabled) return rem;

    // Check if day matches and time matches
    if (rem.days.includes(currentDay) && rem.time === currentTimeStr) {
      // Check if already triggered today
      if (rem.lastTriggeredDate !== todayStr) {
        // Map category item to Notification category
        let notifCat: any = 'Knowledge';
        if (rem.category === 'Workout') notifCat = 'Health';
        else if (rem.category === 'Prayer') notifCat = 'Faith';
        else if (rem.category === 'Language Practice') notifCat = 'Languages';
        else if (rem.category === 'Projects') notifCat = 'Creator';
        else if (rem.category === 'Study') notifCat = 'Knowledge';

        dispatchNotification(
          `${rem.name} Command`,
          `High Priority alert: It is time to begin your scheduled ${rem.category} contract.`,
          notifCat,
          'High'
        );

        updated = true;
        return {
          ...rem,
          lastTriggeredDate: todayStr,
        };
      }
    }
    return rem;
  });

  if (updated) {
    saveReminders(modifiedReminders);
  }
};
