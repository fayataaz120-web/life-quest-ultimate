/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from '../LucideIcon';
import { ScheduledQuest } from '../../types/calendar';
import { getDaysDifference } from '../../services/calendar';

interface CalendarDrawerProps {
  selectedDateStr: string;
  entry: { xpGained: number; coinsGained: number; completedCount: number } | undefined;
  dayQuests: ScheduledQuest[];
  companion: { name: string; role: string; colorTheme: { glow: string } };
  companionMessage: string;
  equippedId: string;
  onPlanQuestClick: () => void;
  onCompleteQuest: (questId: string) => void;
  onDeleteQuest: (questId: string) => void;
}

export const CalendarDrawer: React.FC<CalendarDrawerProps> = ({
  selectedDateStr,
  entry,
  dayQuests,
  companion,
  companionMessage,
  equippedId,
  onPlanQuestClick,
  onCompleteQuest,
  onDeleteQuest,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isFuture = getDaysDifference(todayStr, selectedDateStr) > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease]">
      
      {/* Left side: Day Info Card */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 backdrop-blur-md space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
              Chronicle Day Details
            </span>
            <h2 className="text-lg font-black text-white tracking-wide">
              {new Date(selectedDateStr + 'T00:00:00Z').toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
          </div>
          <button
            onClick={onPlanQuestClick}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <LucideIcon name="CalendarPlus" size={11} />
            Plan Quest
          </button>
        </div>

        {/* XP / Coins rollups */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[9px] text-slate-500 font-mono block">XP GAINED</span>
            <span className="text-lg font-black text-emerald-400">+{entry?.xpGained || 0} XP</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[9px] text-slate-500 font-mono block">COINS EARNED</span>
            <span className="text-lg font-black text-amber-500">+{entry?.coinsGained || 0}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[9px] text-slate-500 font-mono block">TASKS CLEARED</span>
            <span className="text-lg font-black text-indigo-400">{entry?.completedCount || 0}</span>
          </div>
        </div>

        {/* Scheduled Quests section */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">
              Planned Quests ({dayQuests.length})
            </h3>
          </div>

          {dayQuests.length === 0 ? (
            <div className="bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl py-6 text-center text-xs text-slate-500">
              No quests planned for this day. Click "Plan Quest" above to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {dayQuests.map((q) => (
                <div
                  key={q.id}
                  className={`p-3 bg-slate-950/80 border rounded-xl flex items-center justify-between gap-4 transition-all ${
                    q.completed ? 'border-emerald-500/30 bg-emerald-950/5' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onCompleteQuest(q.id)}
                      disabled={q.completed || isFuture}
                      className={`p-1 rounded-md border transition-all ${
                        q.completed
                          ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30'
                          : isFuture
                          ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                          : 'border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer'
                      }`}
                      title={q.completed ? 'Completed' : isFuture ? 'Cannot complete future tasks' : 'Complete Quest'}
                    >
                      <LucideIcon name={q.completed ? 'Check' : 'Square'} size={14} />
                    </button>
                    <div>
                      <span
                        className={`text-xs font-semibold text-slate-200 block ${
                          q.completed ? 'line-through opacity-50' : ''
                        }`}
                      >
                        {q.name}
                      </span>
                      <div className="flex gap-1.5 items-center mt-1">
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono tracking-wider capitalize">
                          {q.categoryId}
                        </span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono tracking-wider">
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteQuest(q.id)}
                    className="p-1 hover:bg-slate-900 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    title="Delete quest"
                  >
                    <LucideIcon name="Trash2" size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Companion Motivation Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 backdrop-blur-md flex flex-col items-center justify-between gap-6 relative overflow-hidden">
        {/* Magic dust styling background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-[80px] pointer-events-none"
          style={{ background: `radial-gradient(circle, ${companion.colorTheme.glow}25 0%, transparent 70%)` }}
        ></div>

        <div className="text-center space-y-1 relative z-10 w-full">
          <span className="text-[8px] font-mono tracking-[0.3em] font-bold text-amber-500 uppercase">
            Active Guardian Insights
          </span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono mt-1">{companion.name}</h3>
          <span className="text-[9px] text-slate-400 block italic font-serif">"{companion.role}"</span>
        </div>

        {/* Chat Speech Bubble */}
        <div
          className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl shadow-xl w-full relative border-l-4"
          style={{ borderLeftColor: companion.colorTheme.glow }}
        >
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-950 border-t border-r border-slate-800 rotate-45 hidden lg:block"></div>
          <p className="text-xs text-slate-300 leading-relaxed font-serif italic text-left">
            "{companionMessage}"
          </p>
        </div>

        {/* Character thumbnail representation */}
        <div className="w-16 h-16 rounded-full border border-slate-800 bg-slate-950 p-1 flex items-center justify-center relative overflow-hidden">
          {equippedId === 'steampunk-sentinel' ? (
            <svg viewBox="0 0 100 100" className="w-full h-full select-none">
              <circle cx="50" cy="50" r="40" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
              <rect x="36" y="44" width="28" height="15" rx="3" fill="#78350f" stroke="#fbbf24" strokeWidth="0.5" />
              <circle cx="43" cy="51" r="5" fill="#f59e0b" />
              <circle cx="57" cy="51" r="5" fill="#f59e0b" />
            </svg>
          ) : equippedId === 'infinity-ascendant' ? (
            <svg viewBox="0 0 100 100" className="w-full h-full select-none">
              <circle cx="50" cy="50" r="40" fill="#0b0f19" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="46" cy="46" r="2.5" fill="#10b981" />
              <circle cx="54" cy="46" r="2.5" fill="#10b981" />
              <path d="M 40 40 Q 50 35, 60 40" stroke="#fbbf24" fill="none" />
            </svg>
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full select-none animate-pulse">
              <polygon points="50,30 65,45 50,60 35,45" fill="#6366f1" />
            </svg>
          )}
        </div>
      </div>

    </div>
  );
};
