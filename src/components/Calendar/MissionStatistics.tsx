/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppState } from '../../types';
import { ScheduledQuest } from '../../types/calendar';
import { LucideIcon } from '../LucideIcon';

interface MissionStatisticsProps {
  state: AppState;
  missions: Record<string, ScheduledQuest[]>;
}

export const MissionStatistics: React.FC<MissionStatisticsProps> = ({ state, missions }) => {
  // 1. Gather all planned missions
  const allMissions: ScheduledQuest[] = [];
  Object.values(missions).forEach((list) => {
    allMissions.push(...list);
  });

  const totalPlanned = allMissions.length;
  const completedPlanned = allMissions.filter((m) => m.completed).length;
  
  // 2. Scan state history for overall stats
  let totalHistoryCompleted = 0;
  let totalXpGained = 0;
  let totalCoinsGained = 0;

  state.history.forEach((h) => {
    totalHistoryCompleted += h.completedCount || 0;
    totalXpGained += h.xpGained || 0;
    totalCoinsGained += h.coinsGained || 0;
  });

  const grandCompleted = completedPlanned + totalHistoryCompleted;
  const completionRate = totalPlanned > 0 ? Math.round((completedPlanned / totalPlanned) * 100) : 0;

  // 3. Scan completed missions for specific category times
  let studyMinutes = 0;
  let fitnessMinutes = 0;
  let languageMinutes = 0;
  let readingMinutes = 0;

  allMissions.forEach((m) => {
    if (!m.completed) return;
    const cat = m.categoryId.toLowerCase();
    const duration = (m as any).estTime || 30; // default 30 mins

    if (cat.includes('study') || cat.includes('academic') || cat.includes('knowledge')) {
      studyMinutes += duration;
    } else if (cat.includes('fitness') || cat.includes('workout') || cat.includes('gym') || cat.includes('health')) {
      fitnessMinutes += duration;
    } else if (cat.includes('language') || cat.includes('vocab')) {
      languageMinutes += duration;
    } else if (cat.includes('reading') || cat.includes('book')) {
      readingMinutes += duration;
    }
  });

  const studyHrs = (studyMinutes / 60).toFixed(1);
  const gymHrs = (fitnessMinutes / 60).toFixed(1);
  const langHrs = (languageMinutes / 60).toFixed(1);
  const bookHrs = (readingMinutes / 60).toFixed(1);

  const stats = [
    { title: 'Total Slayed', val: grandCompleted, desc: 'Completions logged', color: 'text-emerald-400', icon: 'CheckCircle' },
    { title: 'Rate (Planned)', val: `${completionRate}%`, desc: 'Target hit ratio', color: 'text-blue-400', icon: 'Target' },
    { title: 'Productivity XP', val: `+${totalXpGained}`, desc: 'Total experience gained', color: 'text-indigo-400', icon: 'Sparkles' },
    { title: 'Gold Accrued', val: `+${totalCoinsGained}`, desc: 'Total treasure minted', color: 'text-amber-500', icon: 'Coins' },
    { title: 'Study Sandbox', val: `${studyHrs} hrs`, desc: 'Academic focus', color: 'text-sky-400', icon: 'BookOpen' },
    { title: 'Gym Yard', val: `${gymHrs} hrs`, desc: 'Workout duration', color: 'text-rose-400', icon: 'Dumbbell' },
    { title: 'Vocab Hours', val: `${langHrs} hrs`, desc: 'Linguistic study', color: 'text-teal-400', icon: 'Languages' },
    { title: 'Scroll Reading', val: `${bookHrs} hrs`, desc: 'Tome reading speed', color: 'text-purple-400', icon: 'Bookmark' },
  ];

  return (
    <div className="space-y-4 font-mono">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-1">
        <LucideIcon name="BarChart" size={13} className="text-emerald-400" />
        Mission Intelligence Output
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider leading-none">
                {s.title}
              </span>
              <span className={s.color}>
                <LucideIcon name={s.icon as any} size={13} />
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-black text-white">{s.val}</div>
              <p className="text-[8px] text-slate-500 font-sans">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MissionStatistics;
