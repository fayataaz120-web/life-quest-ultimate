/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalendarCell, ScheduledQuest } from '../../types/calendar';

interface CalendarGridProps {
  cells: CalendarCell[];
  selectedDateStr: string | null;
  onCellClick: (dateStr: string) => void;
  history: { date: string; xpGained: number; coinsGained: number; completedCount: number }[];
  scheduledQuests: Record<string, ScheduledQuest[]>;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  cells,
  selectedDateStr,
  onCellClick,
  history,
  scheduledQuests,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-950/80 border border-slate-800/60 rounded-3xl p-4 md:p-6 shadow-2xl relative">
      {/* Days of the week header */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Monthly Grid cells */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 min-h-[350px]">
        {cells.map((cell, idx) => {
          const entry = history.find((h) => h.date === cell.dateStr);
          const xp = entry?.xpGained || 0;
          const coins = entry?.coinsGained || 0;
          const completedCount = entry?.completedCount || 0;
          const dayQuests = scheduledQuests[cell.dateStr] || [];

          // Heatmap color calculations
          let cellStyle = 'bg-slate-900/30 hover:bg-slate-800/60 border border-slate-900/40 text-slate-400';
          if (xp > 0 && xp <= 20) {
            cellStyle =
              'bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-900/20 text-emerald-400 shadow-[inset_0_0_6px_rgba(16,185,129,0.1)]';
          } else if (xp > 20 && xp <= 50) {
            cellStyle =
              'bg-emerald-900/30 hover:bg-emerald-800/40 border border-emerald-800/30 text-emerald-200 shadow-[inset_0_0_10px_rgba(16,185,129,0.25)]';
          } else if (xp > 50 && xp <= 100) {
            cellStyle =
              'bg-emerald-800/40 hover:bg-emerald-700/45 border border-emerald-500/40 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
          } else if (xp > 100) {
            cellStyle =
              'bg-amber-950/40 hover:bg-amber-900/45 border border-amber-500/50 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.25)]';
          }

          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDateStr;

          return (
            <div
              key={idx}
              onClick={() => onCellClick(cell.dateStr)}
              className={`relative flex flex-col justify-between p-1.5 md:p-3 min-h-[60px] md:min-h-[90px] rounded-xl md:rounded-2xl transition-all duration-200 cursor-pointer ${cellStyle} ${
                !cell.isCurrentMonth ? 'opacity-30' : ''
              } ${isToday ? 'ring-2 ring-indigo-500' : ''} ${isSelected ? 'ring-2 ring-amber-500' : ''}`}
            >
              {/* Top row inside cell */}
              <div className="flex justify-between items-start">
                <span className={`text-[10px] md:text-xs font-mono font-bold ${isToday ? 'text-indigo-400' : ''}`}>
                  {cell.dayNum}
                </span>

                {/* Task completion dot badges */}
                <div className="flex gap-0.5">
                  {dayQuests.length > 0 && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        dayQuests.every((q) => q.completed) ? 'bg-emerald-400' : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                  )}
                  {completedCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </div>
              </div>

              {/* XP and Coins layout inside cell */}
              {xp > 0 ? (
                <div className="mt-2 text-left space-y-0.5">
                  <div className="text-[8px] md:text-[10px] font-black tracking-wider uppercase font-mono">
                    +{xp} XP
                  </div>
                  <div className="hidden md:block text-[8px] text-slate-400 font-mono">+{coins} Coins</div>
                </div>
              ) : (
                <div className="h-4"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
