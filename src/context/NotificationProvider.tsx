/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QuestNotification, NotificationSettings } from '../types/notification';
import { ReminderItem, loadReminders, saveReminders, checkReminders } from '../services/ReminderEngine';
import {
  loadNotifications,
  saveNotifications,
  loadNotificationSettings,
  saveNotificationSettings,
} from '../services/NotificationService';

interface NotificationContextProps {
  notifications: QuestNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  reminders: ReminderItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  archiveNotification: (id: string) => void;
  snoozeNotification: (id: string, minutes: number) => void;
  updateSettings: (config: NotificationSettings) => void;
  saveReminderList: (list: ReminderItem[]) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<QuestNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS_INITIAL);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  // 1. Initial Load
  useEffect(() => {
    setNotifications(loadNotifications());
    setSettings(loadNotificationSettings());
    setReminders(loadReminders());
  }, []);

  // 2. Real-time updates from service dispatches (via custom window events)
  useEffect(() => {
    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<QuestNotification>;
      setNotifications((prev) => [customEvent.detail, ...prev]);
    };

    window.addEventListener('magic-notification-received', handleNewNotif);
    return () => {
      window.removeEventListener('magic-notification-received', handleNewNotif);
    };
  }, []);

  // 3. Background Alarm checking interval
  useEffect(() => {
    // Run initial check
    checkReminders();

    const interval = setInterval(() => {
      checkReminders();
      // Reload reminders state in case it updated inside reminder engine
      setReminders(loadReminders());
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // 4. Methods
  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, archived: true } : n));
      saveNotifications(updated);
      return updated;
    });
  };

  const snoozeNotification = (id: string, minutes: number) => {
    const snoozeTime = new Date(Date.now() + minutes * 60000).toISOString();
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, snoozedUntil: snoozeTime } : n));
      saveNotifications(updated);
      return updated;
    });
  };

  const updateSettings = (config: NotificationSettings) => {
    setSettings(config);
    saveNotificationSettings(config);
  };

  const saveReminderList = (list: ReminderItem[]) => {
    setReminders(list);
    saveReminders(list);
  };

  // Filter out expired snoozes and archived items for count
  const activeNotifications = notifications.filter((n) => {
    if (n.archived) return false;
    if (n.snoozedUntil && new Date(n.snoozedUntil) > new Date()) return false;
    return true;
  });

  const unreadCount = activeNotifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: activeNotifications,
        unreadCount,
        settings,
        reminders,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        archiveNotification,
        snoozeNotification,
        updateSettings,
        saveReminderList,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const DEFAULT_SETTINGS_INITIAL: NotificationSettings = {
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

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
