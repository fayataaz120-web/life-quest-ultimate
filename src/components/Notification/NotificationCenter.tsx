/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationProvider';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';
import { QuestNotification } from '../../types/notification';
import { ReminderItem } from '../../services/ReminderEngine';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'alarms' | 'settings'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const {
    notifications,
    settings,
    reminders,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    snoozeNotification,
    updateSettings,
    saveReminderList,
  } = useNotification();

  // Listen to toggle events
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
      sfx.playClick();
    };
    window.addEventListener('magic-toggle-notification-center', handleToggle);
    return () => window.removeEventListener('magic-toggle-notification-center', handleToggle);
  }, []);

  const getPriorityStyle = (p: QuestNotification['priority']) => {
    switch (p) {
      case 'Legendary':
        return 'border-amber-500 bg-amber-950/15 shadow-[0_0_12px_rgba(245,158,11,0.15)] text-amber-400';
      case 'Critical':
        return 'border-rose-500 bg-rose-950/10 text-rose-400';
      case 'High':
        return 'border-orange-500 bg-orange-950/5 text-orange-400';
      case 'Low':
        return 'border-slate-800 bg-slate-900/10 text-slate-500';
      default:
        return 'border-slate-800 bg-slate-950/40 text-blue-400';
    }
  };

  const getCategoryIcon = (cat: QuestNotification['category']) => {
    switch (cat) {
      case 'Quests': return 'Compass' as const;
      case 'Achievements': return 'Trophy' as const;
      case 'Journey': return 'Milestone' as const;
      case 'Companions': return 'Users' as const;
      case 'Health': return 'Activity' as const;
      case 'Faith': return 'Moon' as const;
      case 'Languages': return 'Languages' as const;
      case 'Creator': return 'Edit' as const;
      case 'Legendary': return 'Award' as const;
      default: return 'Bell' as const;
    }
  };

  // Filter notifications
  const filteredNotifs = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'All',
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
  ];

  const handleToggleReminder = (id: string) => {
    sfx.playClick();
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    saveReminderList(updated);
  };

  const handleTimeChange = (id: string, time: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, time } : r));
    saveReminderList(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950 z-[990] cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-950/95 border-l border-slate-900 shadow-2xl z-[991] flex flex-col backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-slate-950/40">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">
                  Central Operations
                </span>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <LucideIcon name="Shield" className="text-emerald-500" size={16} />
                  Headquarters Inbox
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-900 text-xs font-mono font-bold uppercase tracking-wider">
              <button
                onClick={() => { sfx.playClick(); setActiveTab('inbox'); }}
                className={`flex-1 py-3 text-center cursor-pointer border-b-2 transition-all ${
                  activeTab === 'inbox' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Inbox ({filteredNotifs.length})
              </button>
              <button
                onClick={() => { sfx.playClick(); setActiveTab('alarms'); }}
                className={`flex-1 py-3 text-center cursor-pointer border-b-2 transition-all ${
                  activeTab === 'alarms' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Alarms
              </button>
              <button
                onClick={() => { sfx.playClick(); setActiveTab('settings'); }}
                className={`flex-1 py-3 text-center cursor-pointer border-b-2 transition-all ${
                  activeTab === 'settings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Console
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-none space-y-4">
              
              {/* TAB 1: INBOX LIST */}
              {activeTab === 'inbox' && (
                <>
                  {/* Search and Filters */}
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-600">
                        <LucideIcon name="Search" size={13} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-slate-700 outline-none"
                      />
                    </div>

                    {/* Category quick selectors */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { sfx.playClick(); setCategoryFilter(cat); }}
                          className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                            categoryFilter === cat
                              ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-900/40 border border-slate-800/80 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Logs filtered: {filteredNotifs.length}</span>
                    <button
                      onClick={() => { sfx.playClick(); markAllAsRead(); }}
                      className="text-emerald-400 hover:underline cursor-pointer"
                    >
                      Clear Unreads
                    </button>
                  </div>

                  {/* Notification List */}
                  {filteredNotifs.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-600 space-y-2">
                      <LucideIcon name="Inbox" size={32} />
                      <span className="text-xs font-mono">Operations Inbox is Clear.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifs.map((n) => {
                        const style = getPriorityStyle(n.priority);
                        const icon = getCategoryIcon(n.category);
                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3.5 border rounded-xl flex items-start gap-3 transition-colors ${style} ${
                              n.read ? 'opacity-55' : 'bg-slate-900/10'
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 shrink-0">
                              <LucideIcon name={icon} size={14} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-slate-200 truncate uppercase">
                                  {n.title}
                                </h4>
                                <span className="text-[8px] font-mono text-slate-600 whitespace-nowrap pl-1">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-350 leading-relaxed break-words">
                                {n.message}
                              </p>

                              {/* Action items inside notification */}
                              <div className="flex gap-2.5 pt-1.5 text-[9px] font-mono font-bold">
                                {!n.read && (
                                  <button
                                    onClick={() => markAsRead(n.id)}
                                    className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                  >
                                    Mark Read
                                  </button>
                                )}
                                <button
                                  onClick={() => { sfx.playClick(); snoozeNotification(n.id, 60); }}
                                  className="text-amber-500 hover:text-amber-400 cursor-pointer"
                                >
                                  Snooze 1h
                                </button>
                                <button
                                  onClick={() => { sfx.playClick(); archiveNotification(n.id); }}
                                  className="text-slate-500 hover:text-slate-350 cursor-pointer"
                                >
                                  Archive
                                </button>
                                <button
                                  onClick={() => { sfx.playClick(); deleteNotification(n.id); }}
                                  className="text-rose-500 hover:text-rose-450 ml-auto cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: RECURRING ALARMS */}
              {activeTab === 'alarms' && (
                <div className="space-y-4">
                  <div className="space-y-1 bg-slate-900/30 border border-slate-800/80 p-3.5 rounded-xl">
                    <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                      <LucideIcon name="Clock" size={13} className="text-emerald-400" />
                      Recurring Reminder Alarms
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Configure custom timing routines to trigger system alerts for daily habits.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {reminders.map((rem) => (
                      <div
                        key={rem.id}
                        className={`p-4 border rounded-xl bg-slate-900/20 flex items-center justify-between transition-colors ${
                          rem.enabled ? 'border-slate-800' : 'border-slate-950 opacity-45'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-200 block">{rem.name}</span>
                          <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-500 uppercase">
                            {rem.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={rem.time}
                            onChange={(e) => handleTimeChange(rem.id, e.target.value)}
                            disabled={!rem.enabled}
                            className="bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300 p-1.5 rounded-lg outline-none focus:border-slate-700"
                          />
                          <button
                            onClick={() => handleToggleReminder(rem.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              rem.enabled
                                ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-400'
                                : 'bg-slate-900 border-slate-850 text-slate-600'
                            }`}
                          >
                            <LucideIcon name={rem.enabled ? 'Bell' : 'BellOff'} size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS CONSOLE */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl space-y-4 text-xs font-mono">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 pb-2 border-b border-slate-900">
                      <LucideIcon name="Sliders" size={13} className="text-emerald-400" />
                      HQ Output Configuration
                    </h3>

                    {/* Enable sounds */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Audio Resonance feedback</span>
                      <button
                        onClick={() => {
                          sfx.playClick();
                          updateSettings({ ...settings, enableSound: !settings.enableSound });
                        }}
                        className={`px-3 py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${
                          settings.enableSound
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-850 text-slate-500'
                        }`}
                      >
                        {settings.enableSound ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Enable in app toasts */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Screen Toast Banners</span>
                      <button
                        onClick={() => {
                          sfx.playClick();
                          updateSettings({ ...settings, enableInApp: !settings.enableInApp });
                        }}
                        className={`px-3 py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${
                          settings.enableInApp
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-850 text-slate-500'
                        }`}
                      >
                        {settings.enableInApp ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Manual DND toggle */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Do Not Disturb (DND)</span>
                      <button
                        onClick={() => {
                          sfx.playClick();
                          updateSettings({ ...settings, dndMode: !settings.dndMode });
                        }}
                        className={`px-3 py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${
                          settings.dndMode
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                            : 'bg-slate-950 border-slate-850 text-slate-500'
                        }`}
                      >
                        {settings.dndMode ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </div>

                    {/* Quiet Hours */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <span className="text-slate-400 block text-[10px]">Quiet Hours Window</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={settings.quietHoursStart}
                          onChange={(e) => updateSettings({ ...settings, quietHoursStart: e.target.value })}
                          className="bg-slate-950 border border-slate-850 text-slate-300 p-1.5 rounded-lg w-full text-center outline-none"
                        />
                        <span className="text-slate-600">to</span>
                        <input
                          type="time"
                          value={settings.quietHoursEnd}
                          onChange={(e) => updateSettings({ ...settings, quietHoursEnd: e.target.value })}
                          className="bg-slate-950 border border-slate-850 text-slate-300 p-1.5 rounded-lg w-full text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default NotificationCenter;
