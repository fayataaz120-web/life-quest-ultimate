/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuestNotification {
  id: string;
  title: string;
  message: string;
  category:
    | 'Quests'
    | 'Achievements'
    | 'Journey'
    | 'Companions'
    | 'Calendar'
    | 'Health'
    | 'Faith'
    | 'Languages'
    | 'Knowledge'
    | 'Creator'
    | 'System'
    | 'Legendary';
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | 'Legendary';
  timestamp: string; // ISO String
  read: boolean;
  archived: boolean;
  snoozedUntil?: string; // ISO String
  companionMessage?: boolean;
}

export interface NotificationSettings {
  enableInApp: boolean;
  enableBrowser: boolean;
  enableSound: boolean;
  enableAnimation: boolean;
  quietHoursStart: string; // "HH:MM"
  quietHoursEnd: string; // "HH:MM"
  dndMode: boolean;
  enabledCategories: string[];
}
