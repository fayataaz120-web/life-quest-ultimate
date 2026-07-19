/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JourneyHistoryEntry } from '../../types/journey';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

interface JourneyCardProps {
  j: JourneyHistoryEntry;
  isReadOnly: boolean;
  onView: (id: string) => void;
  onRestore: (id: string) => void;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
  j,
  isReadOnly,
  onView,
  onRestore,
}) => {
  return (
    <tr className="hover:bg-slate-900/30 border-b border-slate-900/60 last:border-b-0 transition-colors">
      <td className="p-4 font-mono font-bold text-blue-400">#{j.number}</td>
      <td className="p-4 font-black text-slate-200">{j.name}</td>
      <td className="p-4 text-slate-400 font-mono text-[10px]">
        {j.startDate} to {j.endDate || 'Present'}
      </td>
      <td className="p-4 text-center font-bold text-amber-400 font-mono">{j.highestLevel}</td>
      <td className="p-4 text-center font-bold text-red-400 font-mono">{j.longestStreak}D</td>
      <td className="p-4 text-center font-bold text-pink-400 font-mono">{j.booksRead}</td>
      <td className="p-4 text-center text-slate-300 font-mono">
        {j.languagesLearned && j.languagesLearned.length > 0 ? (
          <span
            title={j.languagesLearned.join(', ')}
            className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-900/40 rounded text-[9px] text-indigo-400"
          >
            {j.languagesLearned.length} learned
          </span>
        ) : (
          <span className="text-slate-600">-</span>
        )}
      </td>
      <td className="p-4 text-center font-bold text-purple-400 font-mono">{j.achievementsCount}</td>
      <td className="p-4 text-center font-bold font-mono">
        <span
          className={`px-2 py-0.5 rounded text-[10px] ${
            j.completionPercentage >= 80
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
              : j.completionPercentage >= 50
              ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
              : 'bg-slate-900/40 text-slate-400 border border-slate-800'
          }`}
        >
          {j.completionPercentage}%
        </span>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => {
              sfx.playSkillUnlock();
              onView(j.id);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
          >
            View Snapshot
          </button>
          {!isReadOnly && (
            <button
              onClick={() => {
                sfx.playLevelUp();
                onRestore(j.id); // In Ledger, onRestore took j.number.toString(), but here we can pass j.id
              }}
              className="px-2.5 py-1 bg-blue-950/40 hover:bg-blue-900/30 border border-blue-900/30 text-blue-400 rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
            >
              Restore
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
export default JourneyCard;
