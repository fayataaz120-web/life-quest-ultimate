/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LucideIcon } from '../LucideIcon';

interface QuestModalProps {
  selectedDateStr: string;
  categories: { id: string; name: string }[];
  onSubmit: (name: string, categoryId: string, difficulty: 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Legendary') => void;
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  selectedDateStr,
  categories,
  onSubmit,
  onClose,
}) => {
  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestCategory, setNewQuestCategory] = useState(categories[0]?.id || 'knowledge');
  const [newQuestDifficulty, setNewQuestDifficulty] = useState<'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Legendary'>('Easy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestName.trim()) return;
    onSubmit(newQuestName.trim(), newQuestCategory, newQuestDifficulty);
    setNewQuestName('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-[scaleUp_0.2s_ease-out]">
        <h3 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
          <LucideIcon name="CalendarPlus" className="text-amber-400" size={18} />
          Plan Quest for {new Date(selectedDateStr + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </h3>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block mb-1">
              Quest Name
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Read 2 chapters of history, 5k run..."
              value={newQuestName}
              onChange={(e) => setNewQuestName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block mb-1">
                Category
              </label>
              <select
                value={newQuestCategory}
                onChange={(e) => setNewQuestCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block mb-1">
                Difficulty
              </label>
              <select
                value={newQuestDifficulty}
                onChange={(e) => setNewQuestDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="Trivial">Trivial (5 XP)</option>
                <option value="Easy">Easy (15 XP)</option>
                <option value="Medium">Medium (40 XP)</option>
                <option value="Hard">Hard (100 XP)</option>
                <option value="Legendary">Epic (250 XP)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-440 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-amber-500/10"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
