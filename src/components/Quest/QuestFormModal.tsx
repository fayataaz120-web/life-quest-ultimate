/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Quest, Category, QuestType, DifficultyLevel } from '../../types/quest';
import { LucideIcon } from '../LucideIcon';
import { calculateRewards } from '../../services/quest';
import { motion } from 'motion/react';

interface QuestFormModalProps {
  isOpen: boolean;
  questToEdit: Quest | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (questData: {
    name: string;
    type: QuestType;
    description: string;
    difficulty: DifficultyLevel;
    xpReward: number;
    coinsReward: number;
    categoryId: string;
  }) => void;
}

export const QuestFormModal: React.FC<QuestFormModalProps> = ({
  isOpen,
  questToEdit,
  categories,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<QuestType>('Daily');
  const [categoryId, setCategoryId] = useState('knowledge');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [xpReward, setXpReward] = useState(60);
  const [coinsReward, setCoinsReward] = useState(20);

  // Initialize form when opening/editing
  useEffect(() => {
    if (questToEdit) {
      setName(questToEdit.name);
      setDescription(questToEdit.description);
      setType(questToEdit.type);
      setCategoryId(questToEdit.categoryId);
      setDifficulty(questToEdit.difficulty);
      setXpReward(questToEdit.xpReward);
      setCoinsReward(questToEdit.coinsReward);
    } else {
      setName('');
      setDescription('');
      setType('Daily');
      setCategoryId(categories[0]?.id || 'knowledge');
      setDifficulty('Medium');
      const baseRewards = calculateRewards('Medium', 'Daily');
      setXpReward(baseRewards.xp);
      setCoinsReward(baseRewards.coins);
    }
  }, [questToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleDifficultyChange = (diff: DifficultyLevel) => {
    setDifficulty(diff);
    const rewards = calculateRewards(diff, type);
    setXpReward(rewards.xp);
    setCoinsReward(rewards.coins);
  };

  const handleQuestTypeChange = (qType: QuestType) => {
    setType(qType);
    const rewards = calculateRewards(difficulty, qType);
    setXpReward(rewards.xp);
    setCoinsReward(rewards.coins);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    onSubmit({
      name: name.trim(),
      type,
      description: description.trim(),
      difficulty,
      xpReward,
      coinsReward,
      categoryId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-[2px] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 border border-amber-900/40 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
          <LucideIcon name="X" size={18} />
        </button>

        <div className="flex gap-3 items-center">
          <div className="p-2 bg-amber-955/40 border border-amber-900/40 rounded-lg text-amber-400">
            <LucideIcon name={questToEdit ? 'Edit' : 'ShieldAlert'} size={20} />
          </div>
          <div>
            <h3 className="text-md font-black text-white font-sans">
              {questToEdit ? 'Modify Quest Contract' : 'Forge Bounty Contract'}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              {questToEdit
                ? 'Adjust the terms and details of this active bounty.'
                : 'Register custom challenges to push your boundaries.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">CONTRACT TITLE</label>
            <input
              type="text"
              required
              placeholder="e.g., Run 10km Marathon, Submit Final Term Thesis, Code App MVP"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">OBJECTIVE SUMMARY</label>
            <textarea
              required
              placeholder="Describe the precise physical or mental proof required to clear this contract..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-16 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">BOUNTY CLASSIFICATION</label>
              <select
                value={type}
                onChange={(e) => handleQuestTypeChange(e.target.value as QuestType)}
                className="w-full bg-slate-955 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Daily">Daily Quest (Normal)</option>
                <option value="Weekly">Weekly Milestone</option>
                <option value="Monthly">Monthly Legendary</option>
                <option value="Boss">Boss Encounter (Massive reward)</option>
                <option value="Legendary">Legendary Objective (Epic scale)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">LINKED GUILD DISCIPLINE</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-955 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 col-span-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">DIFFICULTY RANK</label>
              <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
                className="w-full bg-slate-955 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Trivial">Trivial</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-[10px] text-blue-400 font-mono uppercase tracking-wider font-bold">XP ESTIMATE</label>
              <input
                type="number"
                required
                value={xpReward}
                onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-955 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-[10px] text-amber-400 font-mono uppercase tracking-wider font-bold">GOLD PAYOUT</label>
              <input
                type="number"
                required
                value={coinsReward}
                onChange={(e) => setCoinsReward(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-955 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-950">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-955 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              {questToEdit ? 'Re-Inscribe Contract' : 'Authorize Contract'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default QuestFormModal;
