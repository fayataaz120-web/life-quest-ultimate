/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestNotification, NotificationSettings } from '../types/notification';
import { notify } from '../animations/NotificationSystem';
import { sfx } from '../utils/audio';

const NOTIF_KEY = 'life_quest_notification_list';
const CONFIG_KEY = 'life_quest_notification_config';

export const DEFAULT_SETTINGS: NotificationSettings = {
  enableInApp: true,
  enableBrowser: false,
  enableSound: true,
  enableAnimation: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
  dndMode: false,
  enabledCategories: [
    'Quests',
    'Achievements',
    'Journey',
    'Companions',
    'Calendar',
    'Health',
    'Faith',
    'Languages',
    'Knowledge',
    'Creator',
    'System',
    'Legendary',
  ],
};

export const loadNotificationSettings = (): NotificationSettings => {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveNotificationSettings = (config: NotificationSettings) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
};

export const loadNotifications = (): QuestNotification[] => {
  try {
    const saved = localStorage.getItem(NOTIF_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveNotifications = (list: QuestNotification[]) => {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
};

// Check if current hour falls within Quiet Hours
const isInQuietHours = (settings: NotificationSettings): boolean => {
  if (settings.dndMode) return true;

  const now = new Date();
  const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const { quietHoursStart, quietHoursEnd } = settings;
  if (quietHoursStart === quietHoursEnd) return false;

  if (quietHoursStart < quietHoursEnd) {
    return currentStr >= quietHoursStart && currentStr <= quietHoursEnd;
  } else {
    // Spans midnight
    return currentStr >= quietHoursStart || currentStr <= quietHoursEnd;
  }
};

// Main Notification dispatch routing
export const dispatchNotification = (
  title: string,
  message: string,
  category: QuestNotification['category'],
  priority: QuestNotification['priority'] = 'Medium',
  companionMessage = false
): QuestNotification | null => {
  const settings = loadNotificationSettings();

  // If DND is active or category is disabled, suppress alert
  if (!settings.enabledCategories.includes(category) || isInQuietHours(settings)) {
    return null;
  }

  const list = loadNotifications();
  const newNotif: QuestNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    message,
    category,
    priority,
    timestamp: new Date().toISOString(),
    read: false,
    archived: false,
    companionMessage,
  };

  const updated = [newNotif, ...list].slice(0, 150); // Keep last 150 items
  saveNotifications(updated);

  // Dispatch custom window event so state providers can react in real-time
  window.dispatchEvent(new CustomEvent('magic-notification-received', { detail: newNotif }));

  // In-App popup alert
  if (settings.enableInApp) {
    let notifyType: 'info' | 'success' | 'warning' | 'achievement' | 'coin' = 'info';
    if (priority === 'Legendary' || priority === 'Critical') {
      notifyType = 'achievement';
    } else if (category === 'Quests' && message.includes('complete')) {
      notifyType = 'success';
    } else if (category === 'Quests' && message.includes('gold')) {
      notifyType = 'coin';
    } else if (priority === 'High') {
      notifyType = 'warning';
    }
    notify(message, notifyType, title);
  }

  // Audio synthesis trigger
  if (settings.enableSound) {
    if (priority === 'Legendary') {
      sfx.playAchievement();
    } else if (category === 'Quests') {
      sfx.playCoin();
    } else if (companionMessage) {
      sfx.playGreeting();
    } else {
      sfx.playClick();
    }
  }

  // Browser level notification
  if (settings.enableBrowser && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: message });
  }

  return newNotif;
};

// Requests browser notification permission
export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};
