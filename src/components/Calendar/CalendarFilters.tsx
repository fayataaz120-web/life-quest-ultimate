/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CalendarFiltersProps {
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (d: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  selectedPriority,
  onPriorityChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2.5 w-full">
      {/* Priority Filter */}
      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 focus:text-white outline-none focus:border-slate-700 cursor-pointer"
      >
        <option value="All">All Priorities</option>
        <option value="Low">Low Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="High">High Priority</option>
        <option value="Critical">Critical Priority</option>
        <option value="Legendary">Legendary Priority</option>
      </select>

      {/* Difficulty Filter */}
      <select
        value={selectedDifficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 focus:text-white outline-none focus:border-slate-700 cursor-pointer"
      >
        <option value="All">All Difficulties</option>
        <option value="Trivial">Trivial</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
        <option value="Legendary">Legendary</option>
      </select>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 focus:text-white outline-none focus:border-slate-700 cursor-pointer"
      >
        <option value="All">All Statuses</option>
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Paused">Paused</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
        <option value="Missed">Missed</option>
      </select>
    </div>
  );
};
export default CalendarFilters;
