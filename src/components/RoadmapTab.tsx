/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoadmapItem, Category, DifficultyLevel } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';

interface RoadmapTabProps {
  roadmap: RoadmapItem[];
  categories: Category[];
  onAddRoadmapItem: (item: Omit<RoadmapItem, 'id' | 'status' | 'dateAdded'>) => void;
  onUpdateRoadmapItem: (id: string, updated: Partial<RoadmapItem>) => void;
  onDeleteRoadmapItem: (id: string) => void;
  onCompleteRoadmapItem: (id: string) => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({
  roadmap,
  categories,
  onAddRoadmapItem,
  onUpdateRoadmapItem,
  onDeleteRoadmapItem,
  onCompleteRoadmapItem,
}) => {
  const [filter, setFilter] = useState<'All' | 'Not Started' | 'In Progress' | 'Completed'>('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);

  // Form states
  const [phase, setPhase] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [xpReward, setXpReward] = useState(100);
  const [coinsReward, setCoinsReward] = useState(40);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'deen');
  const [targetDate, setTargetDate] = useState('');
  
  // Autocomplete phase list
  const existingPhases = Array.from(new Set(roadmap.map(item => item.phase))).filter(Boolean);

  const getDifficultyColor = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'Trivial': return 'text-slate-400 border-slate-800';
      case 'Easy': return 'text-emerald-400 border-emerald-950/40';
      case 'Medium': return 'text-blue-400 border-blue-950/40';
      case 'Hard': return 'text-amber-500 border-amber-900/40';
      case 'Legendary': return 'text-red-500 border-red-950/40';
    }
  };

  const handleDifficultyScale = (diff: DifficultyLevel) => {
    let xp = 50;
    let coins = 20;
    switch (diff) {
      case 'Trivial': xp = 25; coins = 10; break;
      case 'Easy': xp = 50; coins = 20; break;
      case 'Medium': xp = 100; coins = 40; break;
      case 'Hard': xp = 200; coins = 80; break;
      case 'Legendary': xp = 500; coins = 200; break;
    }
    setDifficulty(diff);
    setXpReward(xp);
    setCoinsReward(coins);
  };

  const handleOpenAddModal = () => {
    setPhase(existingPhases[0] || 'Phase 1: Initiation');
    setName('');
    setDescription('');
    handleDifficultyScale('Medium');
    setCategoryId(categories[0]?.id || 'deen');
    setTargetDate('');
    setShowAddModal(true);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phase.trim()) return;

    onAddRoadmapItem({
      phase: phase.trim(),
      name: name.trim(),
      description: description.trim(),
      difficulty,
      xpReward,
      coinsReward,
      categoryId,
      targetDate: targetDate || undefined,
    });

    setShowAddModal(false);
    sfx.playSkillUnlock();
  };

  const handleOpenEditModal = (item: RoadmapItem) => {
    setEditingItem(item);
    setPhase(item.phase);
    setName(item.name);
    setDescription(item.description);
    setDifficulty(item.difficulty);
    setXpReward(item.xpReward);
    setCoinsReward(item.coinsReward);
    setCategoryId(item.categoryId || categories[0]?.id || 'deen');
    setTargetDate(item.targetDate || '');
    setShowEditModal(true);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !name.trim() || !phase.trim()) return;

    onUpdateRoadmapItem(editingItem.id, {
      phase: phase.trim(),
      name: name.trim(),
      description: description.trim(),
      difficulty,
      xpReward,
      coinsReward,
      categoryId,
      targetDate: targetDate || undefined,
    });

    setShowEditModal(false);
    setEditingItem(null);
    sfx.playSkillUnlock();
  };

  const handleStatusChange = (id: string, newStatus: 'Not Started' | 'In Progress') => {
    onUpdateRoadmapItem(id, { status: newStatus });
    sfx.playSkillUnlock();
  };

  // Group milestones by Phase
  const filteredRoadmap = roadmap.filter(item => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  const phasesMap = filteredRoadmap.reduce<{ [phaseName: string]: RoadmapItem[] }>((acc, item) => {
    if (!acc[item.phase]) {
      acc[item.phase] = [];
    }
    acc[item.phase].push(item);
    return acc;
  }, {});

  // Sort phases sequentially (simple alpha-numerical sort on phase name)
  const sortedPhases = Object.keys(phasesMap).sort();

  // Progress metrics
  const completedCount = roadmap.filter(r => r.status === 'Completed').length;
  const totalCount = roadmap.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6" 
      id="roadmap-tab-container"
    >
      {/* HEADER PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
            <LucideIcon name="Map" className="text-indigo-400" />
            Legendary Career & Life Roadmap
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map out the grand architecture of your destiny. Group quests and milestones into chronological phases to master long-term campaigns.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.25)] cursor-pointer"
        >
          <LucideIcon name="PlusCircle" size={14} />
          Inscribe Milestone Node
        </button>
      </div>

      {/* SUMMARY STATS & PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-slate-950/40 border border-slate-900/80 p-4 rounded-xl flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">ROADMAP RESOLUTION PROGRESS</span>
            <span className="text-indigo-400 font-bold">{progressPercent}% ({completedCount}/{totalCount} Nodes)</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="bg-gradient-to-r from-indigo-550 via-blue-500 to-emerald-450 h-full rounded-full"
            ></motion.div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-950/50 border border-indigo-900/40 rounded-lg text-indigo-400">
            <LucideIcon name="Activity" size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono">IN PROGRESS NODES</div>
            <div className="text-lg font-bold text-slate-200 font-mono">
              {roadmap.filter(r => r.status === 'In Progress').length}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-950/50 border border-emerald-900/40 rounded-lg text-emerald-400">
            <LucideIcon name="CheckCircle" size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono">RESOLVED DESTINIES</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {completedCount}
            </div>
          </div>
        </div>
      </div>

      {/* TABS FILTER */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 border border-slate-800/80 rounded-xl">
        {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${filter === status ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent'}`}
          >
            {status === 'All' ? 'ALL DESTINY NODES' : status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ROADMAP TIMELINE */}
      {sortedPhases.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-xl">
          <LucideIcon name="Map" className="mx-auto text-slate-700 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-400 font-sans">No Milestone Nodes Found</h3>
          <p className="text-xs text-slate-500 mt-1">Add milestone nodes or adjust filters to visualize your roadmap.</p>
          <button
            onClick={handleOpenAddModal}
            className="text-indigo-400 font-mono text-xs mt-4 underline hover:text-indigo-300"
          >
            Inscribe your first milestone node
          </button>
        </div>
      ) : (
        <div className="space-y-12 relative before:absolute before:top-4 before:bottom-4 before:left-6 md:before:left-1/2 before:w-[2px] before:bg-slate-800/60">
          {sortedPhases.map((phaseName, phaseIndex) => {
            const phaseItems = phasesMap[phaseName];
            return (
              <div key={phaseName} className="space-y-6 relative">
                {/* Phase Header Center Node */}
                <div className="flex md:justify-center items-center relative z-10 pl-12 md:pl-0">
                  <div className="px-4 py-1.5 bg-slate-900 border-2 border-indigo-500/80 rounded-full text-xs font-bold font-mono tracking-widest text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] uppercase">
                    {phaseName}
                  </div>
                </div>

                {/* Phase Items Timeline Grid */}
                <div className="grid grid-cols-1 gap-6 pl-12 md:pl-0">
                  <AnimatePresence mode="popLayout">
                    {phaseItems.map((item, itemIdx) => {
                      const cat = categories.find(c => c.id === item.categoryId);
                      const isEven = itemIdx % 2 === 0;
                      
                      return (
                        <motion.div 
                          key={item.id} 
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className={`flex flex-col md:flex-row items-stretch md:w-1/2 ${isEven ? 'md:ml-auto md:pl-8' : 'md:mr-auto md:pr-8 md:items-end'}`}
                        >
                          {/* Timeline Connector Dot */}
                          <div className="absolute left-6 md:left-1/2 w-3.5 h-3.5 bg-slate-950 border-2 border-slate-700 rounded-full -translate-x-1/2 translate-y-6 z-25 group">
                            <div className={`w-full h-full rounded-full transition-all ${item.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : item.status === 'In Progress' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}></div>
                          </div>

                          {/* Milestone Card */}
                          <div className={`w-full bg-slate-900/30 border rounded-xl p-5 hover:bg-slate-900/50 hover:border-slate-700/60 transition-all duration-300 relative group flex flex-col justify-between ${item.status === 'Completed' ? 'border-slate-800/80 opacity-70' : 'border-slate-800'}`}>
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                {/* Status Badge */}
                                <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                                  item.status === 'Completed' ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' :
                                  item.status === 'In Progress' ? 'bg-indigo-950/30 border-indigo-900/40 text-indigo-400' :
                                  'bg-slate-950 border-slate-800 text-slate-400'
                                }`}>
                                  {item.status.toUpperCase()}
                                </span>
                                
                                {/* Actions menu */}
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleOpenEditModal(item)}
                                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-950/80 transition-colors cursor-pointer"
                                    title="Forge modifications"
                                  >
                                    <LucideIcon name="Edit" size={12} />
                                  </button>
                                  <button
                                    onClick={() => onDeleteRoadmapItem(item.id)}
                                    className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-950/80 transition-colors cursor-pointer"
                                    title="Dissolve node"
                                  >
                                    <LucideIcon name="Trash" size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Details */}
                              <div>
                                <h3 className={`text-sm font-bold tracking-tight text-white ${item.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                                  {item.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                              </div>

                              {/* Meta items */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {cat && (
                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded bg-${cat.color}-950/40 border border-${cat.color}-900/40 text-${cat.color}-400`}>
                                    {cat.name}
                                  </span>
                                )}
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border bg-slate-950 ${getDifficultyColor(item.difficulty)}`}>
                                  DIFFICULTY: {item.difficulty.toUpperCase()}
                                </span>
                                {item.targetDate && (
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-slate-800/80 bg-slate-950 text-slate-400 flex items-center gap-1">
                                    <LucideIcon name="Calendar" size={9} />
                                    TARGET: {item.targetDate}
                                  </span>
                                )}
                                {item.completedDate && (
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-900/30 bg-emerald-950/15 text-emerald-400 flex items-center gap-1">
                                    <LucideIcon name="Calendar" size={9} />
                                    CLEARED: {item.completedDate}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Rewards & State actions */}
                            <div className="border-t border-slate-900/80 mt-4 pt-3 flex items-center justify-between">
                              <div className="font-mono text-xs">
                                <span className="text-blue-400 font-bold">+{item.xpReward} XP</span>
                                <span className="text-amber-500 font-bold ml-2">+{item.coinsReward} Gold</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {item.status !== 'Completed' && (
                                  <>
                                    {item.status === 'Not Started' && (
                                      <button
                                        onClick={() => handleStatusChange(item.id, 'In Progress')}
                                        className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-bold font-mono text-slate-300 rounded cursor-pointer transition-all"
                                      >
                                        Begin
                                      </button>
                                    )}
                                    {item.status === 'In Progress' && (
                                      <button
                                        onClick={() => handleStatusChange(item.id, 'Not Started')}
                                        className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-bold font-mono text-slate-400 rounded cursor-pointer transition-all"
                                      >
                                        Pause
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onCompleteRoadmapItem(item.id)}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold font-mono text-white rounded cursor-pointer transition-all shadow-[0_0_8px_rgba(99,102,241,0.2)] flex items-center gap-1"
                                    >
                                      <LucideIcon name="Compass" size={10} />
                                      Resolve Node
                                    </button>
                                  </>
                                )}
                                {item.status === 'Completed' && (
                                  <div className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-0.5 bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded">
                                    <LucideIcon name="Check" size={10} />
                                    CLEARED
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MILESTONE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-indigo-900/40 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={18} />
              </button>

              <div className="flex gap-3 items-center">
                <div className="p-2 bg-indigo-950/40 border border-indigo-900/40 rounded-lg text-indigo-400">
                  <LucideIcon name="Map" size={20} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white font-sans">Forge Roadmap Milestone Node</h3>
                  <p className="text-xs text-slate-400">Inscribe a new core milestone in your career or life campaign.</p>
                </div>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">ROADMAP PHASE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phase 1: Initiation"
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                      list="phases-list"
                    />
                    <datalist id="phases-list">
                      {existingPhases.map(p => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">LINKED DISCIPLINE</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">MILESTONE TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Build Portfolios & Get 3 Clients, Complete AWS Architect Cert"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">OBJECTIVE SUMMARY</label>
                  <textarea
                    placeholder="Describe what specific deliverables or proof represent the completion of this roadmap node..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">DIFFICULTY RANK</label>
                    <select
                      value={difficulty}
                      onChange={(e) => handleDifficultyScale(e.target.value as DifficultyLevel)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Trivial">Trivial (chore)</option>
                      <option value="Easy">Easy (minor goal)</option>
                      <option value="Medium">Medium (standard milestone)</option>
                      <option value="Hard">Hard (major milestone)</option>
                      <option value="Legendary">Legendary (career shifting)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">TARGET DATE (OPTIONAL)</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-mono">XP CACHE</label>
                    <input
                      type="number"
                      value={xpReward}
                      onChange={(e) => setXpReward(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-mono">GOLD PAYOUT</label>
                    <input
                      type="number"
                      value={coinsReward}
                      onChange={(e) => setCoinsReward(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                >
                  Inscribe Milestone Node & Place on Map
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MILESTONE MODAL */}
      <AnimatePresence>
        {showEditModal && editingItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-indigo-900/40 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={18} />
              </button>

              <div className="flex gap-3 items-center">
                <div className="p-2 bg-indigo-950/40 border border-indigo-900/40 rounded-lg text-indigo-400">
                  <LucideIcon name="Edit" size={20} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white font-sans">Forge Modifications: Roadmap Milestone</h3>
                  <p className="text-xs text-slate-400">Edit the properties of this existing roadmap node.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateItem} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">ROADMAP PHASE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phase 1: Initiation"
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                      list="phases-list"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">LINKED DISCIPLINE</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">MILESTONE TITLE</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">OBJECTIVE SUMMARY</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">DIFFICULTY RANK</label>
                    <select
                      value={difficulty}
                      onChange={(e) => handleDifficultyScale(e.target.value as DifficultyLevel)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Trivial">Trivial (chore)</option>
                      <option value="Easy">Easy (minor goal)</option>
                      <option value="Medium">Medium (standard milestone)</option>
                      <option value="Hard">Hard (major milestone)</option>
                      <option value="Legendary">Legendary (career shifting)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">TARGET DATE (OPTIONAL)</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-mono">XP CACHE</label>
                    <input
                      type="number"
                      value={xpReward}
                      onChange={(e) => setXpReward(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-mono">GOLD PAYOUT</label>
                    <input
                      type="number"
                      value={coinsReward}
                      onChange={(e) => setCoinsReward(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                >
                  Inscribe Modifications & Update Map
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
