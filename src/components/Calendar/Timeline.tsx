/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mission } from '../../types/calendar';
import { LucideIcon } from '../LucideIcon';

interface TimelineProps {
  missions: Mission[];
  onEditMission: (mission: Mission) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ missions, onEditMission }) => {
  // Generate hours from 00:00 to 23:00
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Group missions by starting hour
  const getMissionsForHour = (hour: number) => {
    return missions.filter((m) => {
      if (!m.startTime) return false;
      const startHour = parseInt(m.startTime.split(':')[0], 10);
      return startHour === hour;
    });
  };

  // Missions without a start time
  const unscheduledMissions = missions.filter((m) => !m.startTime);

  const formatHourLabel = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(displayHour).padStart(2, '0')}:00 ${ampm}`;
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Unscheduled / Flex items */}
      {unscheduledMissions.length > 0 && (
        <div className="bg-slate-900/30 border border-dashed border-slate-800 p-4 rounded-2xl space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <LucideIcon name="Layers" size={12} />
            Flex Time / Untethered Missions ({unscheduledMissions.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unscheduledMissions.map((m) => (
              <div
                key={m.id}
                onClick={() => onEditMission(m)}
                className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-750 transition-colors"
              >
                <div className="truncate pr-2">
                  <span className="text-[10px] font-bold text-slate-350 block truncate">{m.name}</span>
                  <span className="text-[8px] text-slate-500 capitalize">{m.difficulty} • {m.priority}</span>
                </div>
                <LucideIcon name="Clock" size={11} className="text-slate-650 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly Timeline Grid */}
      <div className="border border-slate-900 rounded-2xl bg-slate-950/20 max-h-[500px] overflow-y-auto scrollbar-none p-3 space-y-1">
        {hours.map((hour) => {
          const hourMissions = getMissionsForHour(hour);
          const hasItems = hourMissions.length > 0;

          return (
            <div
              key={hour}
              className={`flex gap-3 py-2 border-b border-slate-950/50 last:border-b-0 min-h-[50px] items-start ${
                hasItems ? 'bg-slate-900/10' : ''
              }`}
            >
              {/* Hour Label */}
              <div className="w-18 text-[9px] text-slate-600 font-bold uppercase shrink-0 pt-1 text-right select-none">
                {formatHourLabel(hour)}
              </div>

              {/* Grid Column Line */}
              <div className="w-px h-full bg-slate-900 self-stretch relative">
                {hasItems && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                )}
              </div>

              {/* Missions in this hour row */}
              <div className="flex-1 space-y-1.5 min-w-0">
                {hasItems ? (
                  hourMissions.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onEditMission(m)}
                      style={{ borderLeftColor: m.colorLabel || '#10b981' }}
                      className="p-2.5 bg-slate-900/60 border border-slate-850 border-l-[3px] rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-200 block truncate leading-tight">
                          {m.name}
                        </span>
                        <div className="flex gap-2 text-[8px] text-slate-500 mt-1 capitalize items-center">
                          <span className="text-slate-400 font-bold">{m.startTime} - {m.endTime || 'End'}</span>
                          <span>•</span>
                          <span>{m.priority} Priority</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {m.completed ? (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 font-bold uppercase">
                            Cleared
                          </span>
                        ) : (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-500 uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[9px] text-slate-700 italic select-none pt-1">Empty Slot</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
export default Timeline;
