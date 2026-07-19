/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from '../LucideIcon';
import { HQ_THEMES } from '../../services/companion';

interface CompanionHQSettingsProps {
  currentLevel: number;
  hqThemeName: string;
  onSelectHQ: (themeName: string) => void;
}

export const CompanionHQSettings: React.FC<CompanionHQSettingsProps> = ({
  currentLevel,
  hqThemeName,
  onSelectHQ,
}) => {
  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
      <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
        <LucideIcon name="Map" size={13} />
        HQ World Evolution
      </h2>
      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
        Your command headquarters evolves automatically as you level up. Earn XP in real-life to unlock majestic cosmic spaces.
      </p>

      <div className="space-y-3">
        {HQ_THEMES.map((theme) => {
          const isUnlocked = currentLevel >= theme.minLevel;
          const isSelected = hqThemeName === theme.name;

          return (
            <div
              key={theme.name}
              onClick={() => isUnlocked && onSelectHQ(theme.name)}
              className={`border rounded-lg p-3 transition-all flex justify-between items-center relative overflow-hidden ${
                isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${
                isSelected
                  ? 'bg-slate-900/80 border-amber-500/40 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                  : 'bg-slate-900/20 border-slate-800/50 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex gap-2.5 items-center relative z-10">
                <div
                  className={`p-1.5 rounded-lg ${
                    isUnlocked
                      ? 'bg-blue-950 border border-blue-900/60 text-blue-400'
                      : 'bg-slate-950 border border-slate-900 text-slate-600'
                  }`}
                >
                  <LucideIcon name={theme.icon} size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{theme.name}</h4>
                  <span className="text-[9px] font-mono text-slate-500">Min Level: {theme.minLevel}</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                {!isUnlocked ? (
                  <LucideIcon name="Lock" size={12} className="text-slate-600" />
                ) : isSelected ? (
                  <span className="text-[8px] font-mono bg-amber-950/40 border border-amber-800/50 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                    Active HQ
                  </span>
                ) : (
                  <LucideIcon name="CheckCircle" size={12} className="text-slate-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CompanionHQSettings;
