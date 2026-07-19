/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mission } from '../../types/calendar';
import { Category } from '../../types';
import { LucideIcon } from '../LucideIcon';
import { calculateQuestRewards } from '../../services/calendar';
import { sfx } from '../../utils/audio';

interface MissionEditorProps {
  categories: Category[];
  initialDateStr: string;
  missionToEdit?: Mission;
  onSubmit: (mission: Mission) => void;
  onClose: () => void;
}

export const MissionEditor: React.FC<MissionEditorProps> = ({
  categories,
  initialDateStr,
  missionToEdit,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState(missionToEdit?.name || '');
  const [desc, setDesc] = useState(missionToEdit?.description || '');
  const [catId, setCatId] = useState(missionToEdit?.categoryId || categories[0]?.id || '');
  const [priority, setPriority] = useState<Mission['priority']>(missionToEdit?.priority || 'Medium');
  const [difficulty, setDifficulty] = useState<Mission['difficulty']>(missionToEdit?.difficulty || 'Medium');
  
  const [estTime, setEstTime] = useState<number>(missionToEdit?.estTime || 30);
  const [startTime, setStartTime] = useState(missionToEdit?.startTime || '09:00');
  const [endTime, setEndTime] = useState(missionToEdit?.endTime || '09:30');
  const [repeat, setRepeat] = useState<Mission['repeat']>(missionToEdit?.repeat || 'None');
  const [tagsStr, setTagsStr] = useState(missionToEdit?.tags?.join(', ') || '');
  const [colorLabel, setColorLabel] = useState(missionToEdit?.colorLabel || '#3b82f6');
  const [reminder, setReminder] = useState(missionToEdit?.reminder || '');
  const [location, setLocation] = useState(missionToEdit?.location || '');
  const [notes, setNotes] = useState(missionToEdit?.notes || '');
  const [linksStr, setLinksStr] = useState(missionToEdit?.links?.join(', ') || '');

  // Checklist state
  const [checklist, setChecklist] = useState<{ id: string; text: string; completed: boolean }[]>(
    missionToEdit?.checklist || []
  );
  const [newCheckItem, setNewCheckItem] = useState('');

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    sfx.playClick();
    setChecklist((prev) => [
      ...prev,
      { id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, text: newCheckItem.trim(), completed: false },
    ]);
    setNewCheckItem('');
  };

  const handleRemoveCheckItem = (id: string) => {
    sfx.playClick();
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Calculate reward based on difficulty
    const multiplier = categories.find((c) => c.id === catId)?.xpMultiplier || 1.0;
    const { xp, coins } = calculateQuestRewards(difficulty, multiplier);

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const links = linksStr
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Compute progress %
    const totalItems = checklist.length;
    const completedItems = checklist.filter((item) => item.completed).length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const mission: Mission = {
      id: missionToEdit?.id || `mission_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: title.trim(),
      description: desc.trim(),
      categoryId: catId,
      priority,
      difficulty,
      completed: missionToEdit?.completed || false,
      status: missionToEdit?.status || 'Not Started',
      type: missionToEdit?.type || 'One-Time',
      estTime,
      startTime,
      endTime,
      deadline: initialDateStr,
      repeat,
      rewardXp: xp,
      rewardCoins: coins,
      tags,
      colorLabel,
      reminder,
      location,
      checklist,
      progress,
      notes,
      links,
    };

    sfx.playQuestComplete();
    onSubmit(mission);
  };

  // Preview rewards
  const multiplier = categories.find((c) => c.id === catId)?.xpMultiplier || 1.0;
  const previewRewards = calculateQuestRewards(difficulty, multiplier);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={handleSave}
        className="relative bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 w-full max-w-lg shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto scrollbar-none"
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <LucideIcon name={missionToEdit ? 'Edit3' : 'CalendarPlus'} className="text-emerald-400" size={16} />
            {missionToEdit ? 'Modify Mission Ledger' : 'Schedule New Mission'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <LucideIcon name="X" size={16} />
          </button>
        </div>

        {/* Quest Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Mission Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Slay 3 hours of compiler code..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Objective / Description
          </label>
          <textarea
            placeholder="Detail components to rewrite or metrics to achieve..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-250 focus:border-slate-700 outline-none h-16 resize-none"
          />
        </div>

        {/* Grid selects */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Discipline Category
            </label>
            <select
              value={catId}
              onChange={(e) => setCatId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:text-white outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Priority Tier
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:text-white outline-none cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Difficulty Factor
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:text-white outline-none cursor-pointer"
            >
              <option value="Trivial">Trivial (Habits)</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Repeat Recurrence
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:text-white outline-none cursor-pointer"
            >
              <option value="None">Once Only</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Timings */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Est Time (mins)
            </label>
            <input
              type="number"
              value={estTime}
              onChange={(e) => setEstTime(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div className="space-y-2 border-t border-slate-800/60 pt-3">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Subtask Checklist ({checklist.length})
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add check item..."
              value={newCheckItem}
              onChange={(e) => setNewCheckItem(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-slate-350 outline-none focus:border-slate-800"
            />
            <button
              type="button"
              onClick={handleAddCheckItem}
              className="px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono font-bold uppercase text-slate-300 rounded-lg cursor-pointer transition-colors"
            >
              Add
            </button>
          </div>

          {checklist.length > 0 && (
            <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-none pr-1">
              {checklist.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded-lg border border-slate-900/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {
                        sfx.playClick();
                        setChecklist((prev) =>
                          prev.map((c) => (c.id === item.id ? { ...c, completed: !c.completed } : c))
                        );
                      }}
                      className="cursor-pointer rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    <span className={`text-[10px] ${item.completed ? 'line-through text-slate-650' : 'text-slate-300'}`}>
                      {item.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCheckItem(item.id)}
                    className="text-slate-600 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                  >
                    <LucideIcon name="X" size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location and Labels */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-800/60 pt-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Study Chamber"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="code, learn"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Dynamic Rewards Preview footer */}
        <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl flex justify-between items-center text-xs font-mono font-bold">
          <div className="text-slate-500">REWARD BOUNTY PREVIEW</div>
          <div className="flex gap-4">
            <span className="text-emerald-400">+{previewRewards.xp} XP</span>
            <span className="text-amber-500">+{previewRewards.coins} GOLD</span>
          </div>
        </div>

        {/* Form controls */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold uppercase cursor-pointer shadow-lg shadow-emerald-950/30"
          >
            {missionToEdit ? 'Save Ledger' : 'Embark Quest'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default MissionEditor;
