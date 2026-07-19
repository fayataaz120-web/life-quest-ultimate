/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState } from '../../types';
import { ScheduledQuest } from '../../types/calendar';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

interface HeatmapProps {
  state: AppState;
  missions: Record<string, ScheduledQuest[]>;
  onSelectDate: (dateStr: string) => void;
}

type ActivityFilter = 'Overall' | 'Study' | 'Workout' | 'Prayer' | 'Reading' | 'Languages';

export const Heatmap: React.FC<HeatmapProps> = ({ state, missions, onSelectDate }) => {
  const [filter, setFilter] = useState<ActivityFilter>('Overall');

  // Generate date list of the last 105 days (15 weeks) grouped by week columns
  const today = new Date();
  const dateList: Date[] = [];
  
  // Align grid to start on a Sunday
  const totalDays = 105;
  const startOffset = today.getDay(); // 0 = Sunday
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - (totalDays - 1 - startOffset));

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    dateList.push(d);
  }

  const getIntensityValue = (dateStr: string): number => {
    // 1. Overall completed count in history or planned missions
    if (filter === 'Overall') {
      const historyEntry = state.history.find((h) => h.date === dateStr);
      const plannedCompleted = (missions[dateStr] || []).filter((q) => q.completed).length;
      return (historyEntry?.completedCount || 0) + plannedCompleted;
    }

    // 2. Specific Category missions count
    const dayMissions = missions[dateStr] || [];
    return dayMissions.filter((m) => {
      if (!m.completed) return false;
      const cat = m.categoryId.toLowerCase();

      if (filter === 'Study' && (cat.includes('study') || cat.includes('academic') || cat.includes('knowledge'))) return true;
      if (filter === 'Workout' && (cat.includes('fitness') || cat.includes('workout') || cat.includes('gym') || cat.includes('health'))) return true;
      if (filter === 'Prayer' && (cat.includes('faith') || cat.includes('prayer') || cat.includes('spiritual'))) return true;
      if (filter === 'Reading' && (cat.includes('reading') || cat.includes('book'))) return true;
      if (filter === 'Languages' && (cat.includes('language') || cat.includes('vocab'))) return true;

      return false;
    }).length;
  };

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'bg-slate-900/35 border-slate-950 text-slate-700';
    if (intensity === 1) return 'bg-emerald-950/20 border-emerald-950/40 text-emerald-500 shadow-[inset_0_0_4px_rgba(16,185,129,0.1)]';
    if (intensity === 2) return 'bg-emerald-900/35 border-emerald-800/20 text-emerald-300 shadow-[inset_0_0_6px_rgba(16,185,129,0.2)]';
    if (intensity === 3) return 'bg-emerald-800/40 border-emerald-500/20 text-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
    return 'bg-amber-950/45 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
  };

  const filters: ActivityFilter[] = ['Overall', 'Study', 'Workout', 'Prayer', 'Reading', 'Languages'];

  // Reshape dates into columns of 7 days (weeks)
  const weeks: Date[][] = [];
  for (let i = 0; i < dateList.length; i += 7) {
    weeks.push(dateList.slice(i, i + 7));
  }

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-4 font-mono">
      
      {/* Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <LucideIcon name="Grid" size={13} className="text-amber-500" />
          Mission Chronicle Heatmap
        </h4>
        
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => { sfx.playClick(); setFilter(f); }}
              className={`px-2 py-1 rounded text-[8px] font-bold uppercase cursor-pointer border transition-all ${
                filter === f
                  ? 'bg-amber-600/20 border-amber-500 text-amber-350 shadow-[0_0_6px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid Layout */}
      <div className="flex gap-2 items-center overflow-x-auto scrollbar-none pb-2">
        {/* Row indicators */}
        <div className="grid grid-rows-7 gap-[3.5px] text-[8px] text-slate-600 font-black pr-1 select-none">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="h-[12px] flex items-center justify-center w-3">
              {idx % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Columns grid */}
        <div className="flex gap-[3.5px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-rows-7 gap-[3.5px]">
              {week.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const intensity = getIntensityValue(dateStr);
                const color = getHeatmapColor(intensity);
                
                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      sfx.playSkillUnlock();
                      onSelectDate(dateStr);
                    }}
                    className={`w-[12px] h-[12px] rounded-[3px] border cursor-pointer hover:border-slate-400 transition-colors ${color}`}
                    title={`${date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}: ${intensity} Completions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend footer */}
      <div className="flex items-center gap-1.5 justify-end text-[8px] text-slate-500">
        <span>Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] border border-slate-950 bg-slate-900/35" />
        <div className="w-[10px] h-[10px] rounded-[2px] border border-emerald-950/40 bg-emerald-950/20" />
        <div className="w-[10px] h-[10px] rounded-[2px] border border-emerald-800/20 bg-emerald-900/35" />
        <div className="w-[10px] h-[10px] rounded-[2px] border border-emerald-500/20 bg-emerald-800/40" />
        <div className="w-[10px] h-[10px] rounded-[2px] border border-amber-500/40 bg-amber-950/45" />
        <span>More</span>
      </div>

    </div>
  );
};
export default Heatmap;
