/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from '../components/LucideIcon';
import { sfx } from '../utils/audio';

export interface MagicNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement' | 'coin';
  title?: string;
}

// Helper function to dispatch notifications globally from anywhere in the codebase
export const notify = (message: string, type: MagicNotification['type'] = 'info', title?: string) => {
  const event = new CustomEvent('magic-notify', {
    detail: { message, type, title }
  });
  window.dispatchEvent(event);
};

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<MagicNotification[]>([]);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: MagicNotification['type']; title?: string }>;
      const { message, type, title } = customEvent.detail;
      const id = `${Date.now()}-${Math.random()}`;

      // Play matching audio cue
      if (type === 'success' || type === 'coin') {
        sfx.playCoin();
      } else if (type === 'achievement') {
        sfx.playAchievement();
      } else {
        sfx.playClick();
      }

      setNotifications((prev) => [...prev, { id, message, type, title }]);

      // Remove after 4 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4200);
    };

    window.addEventListener('magic-notify', handleNotification);
    return () => {
      window.removeEventListener('magic-notify', handleNotification);
    };
  }, []);

  const getStyle = (type: MagicNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/40 shadow-emerald-950/20',
          bg: 'bg-emerald-950/20 backdrop-blur-lg',
          iconColor: 'text-emerald-400',
          icon: 'CheckCircle' as const,
          defaultTitle: 'Task Slayed',
        };
      case 'achievement':
        return {
          border: 'border-amber-500/40 shadow-amber-950/20',
          bg: 'bg-amber-950/20 backdrop-blur-lg',
          iconColor: 'text-amber-400',
          icon: 'Trophy' as const,
          defaultTitle: 'Achievement Unlocked',
        };
      case 'coin':
        return {
          border: 'border-yellow-500/40 shadow-yellow-950/20',
          bg: 'bg-yellow-950/20 backdrop-blur-lg',
          iconColor: 'text-yellow-400',
          icon: 'Coins' as const,
          defaultTitle: 'Gold Transmuted',
        };
      case 'warning':
        return {
          border: 'border-rose-500/40 shadow-rose-950/20',
          bg: 'bg-rose-950/20 backdrop-blur-lg',
          iconColor: 'text-rose-400',
          icon: 'AlertTriangle' as const,
          defaultTitle: 'Raid Alert',
        };
      default:
        return {
          border: 'border-blue-500/40 shadow-blue-950/20',
          bg: 'bg-slate-900/90 backdrop-blur-lg',
          iconColor: 'text-blue-400',
          icon: 'Sparkles' as const,
          defaultTitle: 'System Insight',
        };
    }
  };

  return (
    <div className="fixed top-6 right-6 z-[999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          const config = getStyle(n.type);
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className={`pointer-events-auto border rounded-2xl p-4 shadow-xl flex items-start gap-3.5 w-full ${config.bg} ${config.border}`}
            >
              <div className={`p-2 rounded-xl bg-slate-950/40 border border-slate-800 ${config.iconColor} shrink-0`}>
                <LucideIcon name={config.icon} size={18} />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-100">
                  {n.title || config.defaultTitle}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed break-words">{n.message}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
                className="text-slate-600 hover:text-slate-400 p-0.5 rounded cursor-pointer self-start"
              >
                <LucideIcon name="X" size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
