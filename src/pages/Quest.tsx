/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Quest, Category, QuestType, DifficultyLevel } from '../types/quest';
import { LucideIcon } from '../components/LucideIcon';
import { sfx } from '../utils/audio';
import { QuestCard } from '../components/Quest/QuestCard';
import { QuestFormModal } from '../components/Quest/QuestFormModal';

interface QuestPageProps {
  quests: Quest[];
  categories: Category[];
  onCompleteQuest: (id: string) => void;
  onAddQuest: (quest: Omit<Quest, 'id' | 'completed' | 'dateAdded'>) => void;
  onUpdateQuest: (id: string, updated: Partial<Quest>) => void;
  onDeleteQuest: (id: string) => void;
}

export const QuestPage: React.FC<QuestPageProps> = ({
  quests,
  categories,
  onCompleteQuest,
  onAddQuest,
  onUpdateQuest,
  onDeleteQuest,
}) => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<QuestType | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);

  const filteredQuests = quests.filter((q) => {
    if (activeTypeFilter === 'All') return true;
    return q.type === activeTypeFilter;
  });

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuestsCount = quests.filter((q) => q.completed).length;

  const handleOpenAdd = () => {
    setQuestToEdit(null);
    setShowModal(true);
  };

  const handleOpenEdit = (quest: Quest) => {
    setQuestToEdit(quest);
    setShowModal(true);
  };

  const handleFormSubmit = (data: {
    name: string;
    type: QuestType;
    description: string;
    difficulty: DifficultyLevel;
    xpReward: number;
    coinsReward: number;
    categoryId: string;
  }) => {
    if (questToEdit) {
      onUpdateQuest(questToEdit.id, data);
    } else {
      onAddQuest(data);
    }
    setShowModal(false);
    sfx.playSkillUnlock();
  };

  const handleComplete = (id: string) => {
    onCompleteQuest(id);
  };

  const handleDelete = (id: string) => {
    onDeleteQuest(id);
  };

  return (
    <div className="space-y-6" id="quest-board-container">
      {/* HEADER PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
            <LucideIcon name="ShieldAlert" className="text-amber-500" />
            Adventurer's Bounty Board
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Enlist in temporary and legendary objectives. Higher stakes grant massive experience caches and rare coin payouts.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-550 to-amber-650 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
        >
          <LucideIcon name="FilePlus" size={14} />
          Inscribe Bounty Contract
        </button>
      </div>

      {/* TABS FILTER */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 border border-slate-800/80 rounded-xl">
        {(['All', 'Daily', 'Weekly', 'Monthly', 'Boss', 'Legendary'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTypeFilter === type
                ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent'
            }`}
          >
            {type === 'All' ? 'ALL CONTRACTS' : `${type.toUpperCase()} QUESTS`}
          </button>
        ))}
      </div>

      {/* QUICK SUMMARY STATUS BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-955/50 border border-blue-900/40 rounded-lg text-blue-400">
            <LucideIcon name="Sword" size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono">ACTIVE CONTRACTS</div>
            <div className="text-lg font-bold text-slate-200 font-mono">{activeQuests.length}</div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-955/50 border border-emerald-900/40 rounded-lg text-emerald-400">
            <LucideIcon name="CheckCircle2" size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono">COMPLETED BOUNTIES</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{completedQuestsCount}</div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-955/50 border border-red-900/40 rounded-lg text-red-400">
            <LucideIcon name="Skull" size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono">BOSSES DEFEATED</div>
            <div className="text-lg font-bold text-red-400 font-mono">
              {quests.filter((q) => q.type === 'Boss' && q.completed).length} / {quests.filter((q) => q.type === 'Boss').length}
            </div>
          </div>
        </div>
      </div>

      {/* BOUNTY GRID */}
      {filteredQuests.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-xl">
          <LucideIcon name="FileText" className="mx-auto text-slate-700 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-400 font-sans">Quest log empty</h3>
          <p className="text-xs text-slate-505 mt-1 font-sans">No active quest contracts match this filter category.</p>
          <button
            onClick={handleOpenAdd}
            className="text-amber-405 font-mono text-xs mt-4 underline hover:text-amber-300"
          >
            Register custom bounty contract
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => {
            const cat = categories.find((c) => c.id === quest.categoryId);
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                category={cat}
                onComplete={() => handleComplete(quest.id)}
                onEdit={() => handleOpenEdit(quest)}
                onDelete={() => handleDelete(quest.id)}
              />
            );
          })}
        </div>
      )}

      {/* FORM MODAL */}
      <QuestFormModal
        isOpen={showModal}
        questToEdit={questToEdit}
        categories={categories}
        onClose={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
export default QuestPage;
