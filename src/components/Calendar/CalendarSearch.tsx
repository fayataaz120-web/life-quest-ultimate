/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from '../LucideIcon';

interface CalendarSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: { id: string; name: string }[];
}

export const CalendarSearch: React.FC<CalendarSearchProps> = ({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 w-full">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
          <LucideIcon name="Search" size={14} />
        </span>
        <input
          type="text"
          placeholder="Filter missions by title, tags, or locations..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 font-mono outline-none focus:border-slate-700 transition-colors"
        />
      </div>

      <div className="flex gap-2 min-w-[160px]">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono outline-none focus:border-slate-700 cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
export default CalendarSearch;
