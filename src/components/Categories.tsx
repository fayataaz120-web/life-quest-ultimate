/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Activity, DifficultyLevel, FrequencyType } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';

interface CategoriesProps {
  categories: Category[];
  activities: Activity[];
  onCompleteActivity: (id: string) => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'completedTimes' | 'currentStreak' | 'longestStreak'>) => void;
  onUpdateActivity: (id: string, updated: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updated: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

const AVAILABLE_COLORS = [
  'emerald', 'red', 'sky', 'indigo', 'rose', 'amber', 'pink', 'teal', 'cyan', 'purple'
];

const AVAILABLE_ICONS = [
  'Compass', 'Dumbbell', 'BookOpen', 'Languages', 'Youtube', 'TrendingUp', 
  'Users', 'Code', 'Briefcase', 'Coins', 'Flame', 'Shield', 'Sparkles', 
  'Heart', 'Smile', 'Trophy', 'Target', 'Activity'
];

export const Categories: React.FC<CategoriesProps> = ({
  categories,
  activities,
  onCompleteActivity,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  // Navigation & filtering states
  const [expandedCatId, setExpandedCatId] = useState<string | null>(categories[0]?.id || "deen");
  const [activityStatusFilter, setActivityStatusFilter] = useState<'Active' | 'Paused' | 'Archived'>('Active');
  
  // Activity creation modal state
  const [showAddActModal, setShowAddActModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: "",
    categoryId: expandedCatId || "deen",
    status: "Active" as const,
    priority: "Medium" as const,
    difficulty: "Medium" as DifficultyLevel,
    frequency: "Daily" as FrequencyType,
    xpReward: 50,
    coinsReward: 15,
    startedDate: new Date().toISOString().split('T')[0],
    targetCount: 100,
    notes: ""
  });

  // Category creation & editing modal states
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "Compass",
    xpMultiplier: 1.0,
    color: "blue"
  });

  const [editCategoryData, setEditCategoryData] = useState<{
    id: string;
    name: string;
    icon: string;
    xpMultiplier: number;
    color: string;
  } | null>(null);

  const getDifficultyColor = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'Trivial': return 'text-slate-400 bg-slate-900 border-slate-800';
      case 'Easy': return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/60';
      case 'Medium': return 'text-blue-400 bg-blue-950/30 border-blue-900/60';
      case 'Hard': return 'text-amber-400 bg-amber-950/30 border-amber-900/60';
      case 'Legendary': return 'text-rose-400 bg-rose-950/40 border-rose-900/80 animate-pulse';
    }
  };

  const getPriorityColor = (priority: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'Low': return 'text-slate-400 bg-slate-900';
      case 'Medium': return 'text-blue-400 bg-blue-950/20';
      case 'High': return 'text-red-400 bg-red-950/20';
    }
  };

  const handleDifficultyChange = (diff: DifficultyLevel) => {
    let xp = 30;
    let coins = 10;
    switch (diff) {
      case 'Trivial': xp = 15; coins = 5; break;
      case 'Easy': xp = 30; coins = 10; break;
      case 'Medium': xp = 50; coins = 18; break;
      case 'Hard': xp = 100; coins = 35; break;
      case 'Legendary': xp = 250; coins = 100; break;
    }
    setNewActivity(prev => ({ ...prev, difficulty: diff, xpReward: xp, coinsReward: coins }));
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.name.trim()) return;

    onAddActivity({
      ...newActivity,
      categoryId: expandedCatId || "deen"
    });
    setNewActivity({
      name: "",
      categoryId: expandedCatId || "deen",
      status: "Active" as const,
      priority: "Medium" as const,
      difficulty: "Medium" as DifficultyLevel,
      frequency: "Daily" as FrequencyType,
      xpReward: 50,
      coinsReward: 15,
      startedDate: new Date().toISOString().split('T')[0],
      targetCount: 100,
      notes: ""
    });
    setShowAddActModal(false);
    sfx.playSkillUnlock();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    onAddCategory(newCategory);
    setExpandedCatId(`cat-${Date.now()}`); // approximate id for quick navigation selection
    setNewCategory({
      name: "",
      icon: "Compass",
      xpMultiplier: 1.0,
      color: "blue"
    });
    setShowAddCatModal(false);
    sfx.playLevelUp();
  };

  const handleUpdateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategoryData || !editCategoryData.name.trim()) return;

    onUpdateCategory(editCategoryData.id, {
      name: editCategoryData.name,
      icon: editCategoryData.icon,
      xpMultiplier: editCategoryData.xpMultiplier,
      color: editCategoryData.color
    });
    setShowEditCatModal(false);
    setEditCategoryData(null);
    sfx.playSkillUnlock();
  };

  const handleDeleteCategorySubmit = (id: string) => {
    if (confirm("Are you absolutely sure you want to delete this guild sector? All training activities associated with it will be destroyed permanently.")) {
      onDeleteCategory(id);
      setShowEditCatModal(false);
      setEditCategoryData(null);
      
      // Auto-fallback to another category
      const remaining = categories.filter(c => c.id !== id);
      setExpandedCatId(remaining[0]?.id || null);
      sfx.playLevelUp(); // play generic sound effect
    }
  };

  return (
    <div className="space-y-6" id="categories-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcon name="Layers" className="text-blue-400 font-bold" />
            Character Skill Sectors
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build and optimize customizable discipline sectors. Pause, archive, or configure repeating real-life training regimens.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowAddCatModal(true)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LucideIcon name="Layers" size={13} className="text-blue-400" />
            + New Sector
          </button>
          <button
            onClick={() => {
              if (expandedCatId) {
                setNewActivity(prev => ({ ...prev, categoryId: expandedCatId }));
              }
              setShowAddActModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer"
          >
            <LucideIcon name="Plus" size={14} />
            Create Activity Log
          </button>
        </div>
      </div>

      {/* TWO PANEL SECTOR VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Discipline Sectors */}
        <div className="space-y-3">
          {categories.map((cat) => {
            const catActs = activities.filter(a => a.categoryId === cat.id);
            const activeCount = catActs.filter(a => a.status === 'Active').length;
            const completedCount = catActs.reduce((acc, c) => acc + c.completedTimes, 0);
            const isExpanded = expandedCatId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setExpandedCatId(cat.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isExpanded 
                    ? `bg-${cat.color}-500/5 border-${cat.color}-500/50 shadow-[0_0_15px_rgba(59,130,246,0.04)]` 
                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-${cat.color}-400`}>
                    <LucideIcon name={cat.icon} size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {activeCount} active • {completedCount} total clears
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{cat.xpMultiplier}x XP</span>
                  <LucideIcon name="ChevronRight" size={14} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Activities within Selected Sector */}
        <div className="lg:col-span-2 space-y-4">
          {expandedCatId ? (() => {
            const currentCat = categories.find(c => c.id === expandedCatId);
            if (!currentCat) return null;
            
            // Filter child activities based on sector & tab (Active, Paused, Archived)
            const catActs = activities.filter(a => {
              const matchesCategory = a.categoryId === expandedCatId;
              const matchesStatus = (a.status || 'Active') === activityStatusFilter;
              return matchesCategory && matchesStatus;
            });

            return (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-md min-h-[450px] flex flex-col justify-between">
                <div>
                  {/* Category Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 mb-5 gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-${currentCat.color}-400`}>
                        <LucideIcon name={currentCat.icon} size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-md font-bold text-white">{currentCat.name} Guild Training</h2>
                          <button
                            onClick={() => {
                              setEditCategoryData(currentCat);
                              setShowEditCatModal(true);
                            }}
                            className="p-1 text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 rounded transition-colors"
                            title="Edit sector settings"
                          >
                            <LucideIcon name="Settings" size={13} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Custom training tasks that continuously build your {currentCat.name} credentials.</p>
                      </div>
                    </div>
                    
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-950 text-blue-400 font-mono border border-slate-800 shrink-0 self-start sm:self-auto">
                      MULTIPLIER: {currentCat.xpMultiplier}x
                    </span>
                  </div>

                  {/* LIFECYCLE TABS (Active, Paused, Archived) */}
                  <div className="flex gap-2 mb-6 p-1 bg-slate-950 border border-slate-850 rounded-lg">
                    {[
                      { key: 'Active', label: 'Active Regimens', icon: 'Play' },
                      { key: 'Paused', label: 'Paused Tasks', icon: 'Pause' },
                      { key: 'Archived', label: 'Archived Chronicle', icon: 'Archive' }
                    ].map((tab) => {
                      const count = activities.filter(a => a.categoryId === expandedCatId && (a.status || 'Active') === tab.key).length;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActivityStatusFilter(tab.key as any)}
                          className={`flex-1 py-1.5 rounded text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activityStatusFilter === tab.key 
                              ? 'bg-slate-900 border border-slate-800 text-blue-400 shadow-sm font-bold' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <LucideIcon name={tab.icon} size={11} />
                          <span>{tab.label}</span>
                          <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-900 border border-slate-800/80 text-slate-500 font-bold">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Activities List */}
                  {catActs.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                      <LucideIcon name="Inbox" className="mx-auto text-slate-600 mb-2" size={32} />
                      <p className="text-xs">No {activityStatusFilter.toLowerCase()} activities found for {currentCat.name}.</p>
                      {activityStatusFilter === 'Active' && (
                        <button
                          onClick={() => {
                            setNewActivity(prev => ({ ...prev, categoryId: expandedCatId }));
                            setShowAddActModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 font-mono text-xs mt-3 underline cursor-pointer"
                        >
                          Create your first activity now
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {catActs.map((act) => (
                        <div key={act.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700/80 transition-all">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-100">{act.name}</h4>
                              <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${getDifficultyColor(act.difficulty)}`}>
                                {act.difficulty}
                              </span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${getPriorityColor(act.priority)}`}>
                                {act.priority}
                              </span>
                              <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                                {act.frequency}
                              </span>
                            </div>
                            
                            {act.notes && <p className="text-xs text-slate-400">{act.notes}</p>}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-mono">
                              <span className="flex items-center gap-1">
                                <LucideIcon name="History" size={11} className="text-slate-600" />
                                Cleared: <span className="text-slate-300 font-bold">{act.completedTimes}</span> / {act.targetCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <LucideIcon name="Flame" size={11} className="text-red-500" />
                                Streak: <span className="text-red-400 font-bold">{act.currentStreak}</span> (Max: {act.longestStreak})
                              </span>
                              <span className="text-slate-600">|</span>
                              <span className="text-slate-500">Started: {act.startedDate}</span>
                            </div>
                          </div>

                          {/* Trigger complete and details */}
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 border-t border-slate-900 pt-3 md:pt-0 md:border-0">
                            {/* Rewards preview */}
                            <div className="font-mono text-xs text-left md:text-right">
                              <div className="text-blue-400">+{Math.round(act.xpReward * currentCat.xpMultiplier)} XP</div>
                              <div className="text-amber-400">+{act.coinsReward} Gold</div>
                            </div>

                            {/* Actions HUD */}
                            <div className="flex items-center gap-2">
                              {/* 1. Complete action - only available when Active */}
                              {act.status !== 'Paused' && act.status !== 'Archived' && (
                                <button
                                  onClick={() => onCompleteActivity(act.id)}
                                  className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1 cursor-pointer bg-blue-650 hover:bg-blue-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                                >
                                  <LucideIcon name="CheckCircle2" size={13} />
                                  Clear
                                </button>
                              )}

                              {/* 2. Pause/Activate state toggles */}
                              {act.status === 'Active' || !act.status ? (
                                <button
                                  onClick={() => {
                                    onUpdateActivity(act.id, { status: 'Paused' });
                                    sfx.playSkillUnlock();
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-950/20 rounded transition-colors"
                                  title="Pause activity tracking"
                                >
                                  <LucideIcon name="Pause" size={13} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    onUpdateActivity(act.id, { status: 'Active' });
                                    sfx.playSkillUnlock();
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/20 rounded transition-colors"
                                  title="Reactivate activity"
                                >
                                  <LucideIcon name="Play" size={13} />
                                </button>
                              )}

                              {/* 3. Archive/Unarchive toggles */}
                              {act.status !== 'Archived' ? (
                                <button
                                  onClick={() => {
                                    onUpdateActivity(act.id, { status: 'Archived' });
                                    sfx.playSkillUnlock();
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-purple-400 hover:bg-purple-950/20 rounded transition-colors"
                                  title="Archive activity"
                                >
                                  <LucideIcon name="Archive" size={13} />
                                </button>
                              ) : null}

                              {/* 4. Delete action */}
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to permanently delete this training activity? This is irreversible.")) {
                                    onDeleteActivity(act.id);
                                  }
                                }}
                                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                                title="Delete training activity"
                              >
                                <LucideIcon name="Trash" size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Automation Tip footer */}
                <div className="mt-6 border-t border-slate-800/40 pt-4 flex gap-2 text-[11px] text-slate-500 leading-relaxed font-mono">
                  <LucideIcon name="Cpu" size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    RPG Rule: Keep training regimens active to grow statistics. Pause or archive temporary routines to optimize your skill constellation.
                  </span>
                </div>
              </div>
            );
          })() : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex items-center justify-center min-h-[450px]">
              <span className="text-slate-500 font-mono text-xs">Select a skill sector from the left to view active logs.</span>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW CATEGORY MODAL */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddCatModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <LucideIcon name="X" size={18} />
            </button>

            <div className="flex gap-3 items-center">
              <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
                <LucideIcon name="Layers" size={20} />
              </div>
              <div>
                <h3 className="text-md font-bold text-white">Create Guild Sector</h3>
                <p className="text-xs text-slate-400">Establish a new customized discipline category in your life operating matrix.</p>
              </div>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">SECTOR NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Spiritual, Networking, Artistry, Mindset"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">XP MULTIPLIER</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="3.0"
                  required
                  value={newCategory.xpMultiplier}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, xpMultiplier: parseFloat(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono">Controls how much additional XP activities in this sector receive.</span>
              </div>

              {/* Color Grid selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono block">COLOR MATRIX</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewCategory(prev => ({ ...prev, color: c }))}
                      className={`h-8 rounded-lg border-2 capitalize text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                        newCategory.color === c 
                          ? `border-${c}-500 bg-${c}-950/20 text-${c}-400 font-bold` 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Grid selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono block">ICON SELECTION</label>
                <div className="grid grid-cols-6 gap-2 max-h-28 overflow-y-auto p-1 bg-slate-950 border border-slate-850 rounded-lg scrollbar-none">
                  {AVAILABLE_ICONS.map(i => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setNewCategory(prev => ({ ...prev, icon: i }))}
                      className={`p-2 rounded-md border flex items-center justify-center hover:bg-slate-900 hover:text-white cursor-pointer ${
                        newCategory.icon === i 
                          ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                          : 'border-transparent text-slate-500'
                      }`}
                      title={i}
                    >
                      <LucideIcon name={i} size={15} />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
              >
                Inscribe Sector
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {showEditCatModal && editCategoryData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowEditCatModal(false);
                setEditCategoryData(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <LucideIcon name="X" size={18} />
            </button>

            <div className="flex gap-3 items-center">
              <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
                <LucideIcon name="Settings" size={20} />
              </div>
              <div>
                <h3 className="text-md font-bold text-white">Edit Guild Sector</h3>
                <p className="text-xs text-slate-400">Modify multipliers, names, and visual designs for this sector.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateCategorySubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">SECTOR NAME</label>
                <input
                  type="text"
                  required
                  value={editCategoryData.name}
                  onChange={(e) => setEditCategoryData(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">XP MULTIPLIER</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="3.0"
                  required
                  value={editCategoryData.xpMultiplier}
                  onChange={(e) => setEditCategoryData(prev => prev ? ({ ...prev, xpMultiplier: parseFloat(e.target.value) }) : null)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>

              {/* Color Grid selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono block">COLOR MATRIX</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setEditCategoryData(prev => prev ? ({ ...prev, color: c }) : null)}
                      className={`h-8 rounded-lg border-2 capitalize text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                        editCategoryData.color === c 
                          ? `border-${c}-500 bg-${c}-950/20 text-${c}-400 font-bold` 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Grid selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono block">ICON SELECTION</label>
                <div className="grid grid-cols-6 gap-2 max-h-28 overflow-y-auto p-1 bg-slate-950 border border-slate-850 rounded-lg scrollbar-none">
                  {AVAILABLE_ICONS.map(i => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setEditCategoryData(prev => prev ? ({ ...prev, icon: i }) : null)}
                      className={`p-2 rounded-md border flex items-center justify-center hover:bg-slate-900 hover:text-white cursor-pointer ${
                        editCategoryData.icon === i 
                          ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                          : 'border-transparent text-slate-500'
                      }`}
                      title={i}
                    >
                      <LucideIcon name={i} size={15} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCategorySubmit(editCategoryData.id)}
                  className="py-2.5 bg-red-950/40 border border-red-900/65 text-red-400 hover:bg-red-900 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Delete Sector
                </button>
                <button
                  type="submit"
                  className="col-span-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer text-center"
                >
                  Save Guild Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW ACTIVITY MODAL */}
      {showAddActModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddActModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <LucideIcon name="X" size={18} />
            </button>

            <div className="flex gap-3 items-center">
              <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
                <LucideIcon name="Sparkles" size={20} />
              </div>
              <div>
                <h3 className="text-md font-bold text-white">Create Guild Activity Log</h3>
                <p className="text-xs text-slate-400">Add a repeatable task that builds stats and grants reward gold coins.</p>
              </div>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">ACTIVITY NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Read Quran Juz, Practice Arabic Vocabulary, Run 5K"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">SECTOR CATEGORY</label>
                  <select
                    value={expandedCatId || "deen"}
                    disabled
                    className="w-full bg-slate-950 border border-slate-850 text-slate-400 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono cursor-not-allowed"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">FREQUENCY</label>
                  <select
                    value={newActivity.frequency}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, frequency: e.target.value as FrequencyType }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Daily">Daily Repeating</option>
                    <option value="Weekly">Weekly Repeating</option>
                    <option value="Monthly">Monthly Repeating</option>
                    <option value="One-time">One-Time Quest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">DIFFICULTY RANK</label>
                  <select
                    value={newActivity.difficulty}
                    onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Trivial">Trivial (15 XP / 5 Gold)</option>
                    <option value="Easy">Easy (30 XP / 10 Gold)</option>
                    <option value="Medium">Medium (50 XP / 18 Gold)</option>
                    <option value="Hard">Hard (100 XP / 35 Gold)</option>
                    <option value="Legendary">Legendary (250 XP / 100 Gold)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">PRIORITY</label>
                  <select
                    value={newActivity.priority}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-mono">BASE XP</label>
                  <input
                    type="number"
                    value={newActivity.xpReward}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-mono">GOLD COINS</label>
                  <input
                    type="number"
                    value={newActivity.coinsReward}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, coinsReward: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-mono">GOAL CLEARS</label>
                  <input
                    type="number"
                    value={newActivity.targetCount}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, targetCount: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">NOTES & ATTUNEMENTS</label>
                <textarea
                  placeholder="Focus details or spiritual intentions..."
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
              >
                Inscribe Training Regiment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
