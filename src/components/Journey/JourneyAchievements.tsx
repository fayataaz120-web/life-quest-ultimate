/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from '../LucideIcon';
import { ALL_ACHIEVEMENTS, ALL_LIFETIME_ACHIEVEMENTS, ALL_LEGACY_BADGES } from '../../services/journey';

interface JourneyAchievementsProps {
  journeyAchievements: string[];
  lifetimeAchievements: string[];
  legacyBadges: string[];
}

export const JourneyAchievements: React.FC<JourneyAchievementsProps> = ({
  journeyAchievements,
  lifetimeAchievements,
  legacyBadges,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. CURRENT JOURNEY COVENANT REWARD SHIELD */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6">
        <div>
          <span className="text-[9px] font-bold text-teal-400 font-mono uppercase tracking-wider">
            Current Active Epoch
          </span>
          <h3 className="text-base font-black text-white mt-0.5">Journey Achievements</h3>
          <p className="text-xs text-slate-450 leading-relaxed mt-1 font-sans">
            Objectives unlocked in this chapter. Resets upon complete rebirth or chronicle splits.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto scrollbar-none pr-1">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = journeyAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3 border rounded-xl flex flex-col justify-between min-h-[90px] transition-all relative overflow-hidden ${
                  isUnlocked
                    ? ach.color + ' border-teal-950/60 shadow-[inset_0_0_8px_rgba(20,184,166,0.1)]'
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-40'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                    {ach.id.replace('-', ' ')}
                  </span>
                  <LucideIcon name={ach.icon} size={15} />
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-black truncate leading-tight text-slate-205">{ach.name}</div>
                  <div className="text-[8px] leading-tight text-slate-500 font-sans mt-0.5 line-clamp-2">{ach.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LIFETIME RECORD RETROSPECTIVES */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6">
        <div>
          <span className="text-[9px] font-bold text-amber-500 font-mono uppercase tracking-wider">
            Ethereal Hall of Fame
          </span>
          <h3 className="text-base font-black text-white mt-0.5">Lifetime Milestones</h3>
          <p className="text-xs text-slate-450 leading-relaxed mt-1 font-sans">
            Permanent legacy objectives accumulating across your entire character career.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto scrollbar-none pr-1">
          {ALL_LIFETIME_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = lifetimeAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3 border rounded-xl flex flex-col justify-between min-h-[90px] transition-all relative overflow-hidden ${
                  isUnlocked
                    ? ach.color + ' border-amber-950/65 shadow-[inset_0_0_8px_rgba(245,158,11,0.1)]'
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-40'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                    {ach.id.replace('-', ' ')}
                  </span>
                  <LucideIcon name={ach.icon} size={15} />
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-black truncate leading-tight text-slate-205">{ach.name}</div>
                  <div className="text-[8px] leading-tight text-slate-500 font-sans mt-0.5 line-clamp-2">{ach.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. HERO BADGES */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6">
        <div>
          <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider">
            Legendary Inscription
          </span>
          <h3 className="text-base font-black text-white mt-0.5">Permanent Badges</h3>
          <p className="text-xs text-slate-450 leading-relaxed mt-1 font-sans">
            Prestigious seals awarded for massive lifetime milestones and epoch conclusions.
          </p>
        </div>

        <div className="space-y-3.5 max-h-[380px] overflow-y-auto scrollbar-none pr-1">
          {ALL_LEGACY_BADGES.map((badge) => {
            const isUnlocked = legacyBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 border rounded-2xl flex items-center gap-4 transition-all relative overflow-hidden ${
                  isUnlocked
                    ? `bg-gradient-to-r ${badge.color}`
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-40'
                }`}
              >
                <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl shrink-0">
                  <LucideIcon name={badge.icon} size={22} className={isUnlocked ? '' : 'text-slate-700'} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wide leading-none">{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1.5 font-sans">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
export default JourneyAchievements;
