/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useNotification } from '../../context/NotificationProvider';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotification();

  const handleToggle = () => {
    sfx.playClick();
    window.dispatchEvent(new CustomEvent('magic-toggle-notification-center'));
  };

  return (
    <button
      onClick={handleToggle}
      className="relative p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer select-none no-drag"
      title="Notification Center"
    >
      <LucideIcon name="Bell" size={17} className={unreadCount > 0 ? 'animate-bounce' : ''} />
      
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center font-mono font-black text-[9px] shadow-lg shadow-rose-950/40 border border-slate-950"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </button>
  );
};
export default NotificationBell;
