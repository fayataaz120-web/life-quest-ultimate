/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SkillNode, Category, PlayerProfile } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';

interface SkillTreeTabProps {
  skills: SkillNode[];
  categories: Category[];
  player: PlayerProfile;
  onUnlockSkill: (id: string, cost: number) => void;
}

export const SkillTreeTab: React.FC<SkillTreeTabProps> = ({
  skills,
  categories,
  player,
  onUnlockSkill,
}) => {
  const [activeBranch, setActiveBranch] = useState<string>('health');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  const filteredSkills = skills.filter(s => s.categoryId === activeBranch);
  const currentBranchCat = categories.find(c => c.id === activeBranch);

  const handleUnlockClick = (skill: SkillNode) => {
    // validations
    if (player.coins < skill.cost) {
      alert("Insufficient Gold Coins! Clear more quests or activities to earn gold.");
      return;
    }
    // check prerequisites
    const missingPre = skill.prerequisites.filter(preId => {
      const preSkill = skills.find(s => s.id === preId);
      return preSkill && !preSkill.unlocked;
    });

    if (missingPre.length > 0) {
      const names = missingPre.map(id => skills.find(s => s.id === id)?.name || id).join(', ');
      alert(`Prerequisite skill(s) locked: [${names}]. Unlock them first!`);
      return;
    }

    onUnlockSkill(skill.id, skill.cost);
    sfx.playSkillUnlock();
    
    // update details popup view
    setSelectedSkill(prev => prev && prev.id === skill.id ? { ...prev, unlocked: true } : prev);
  };

  return (
    <div className="space-y-6" id="skill-tree-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
            <LucideIcon name="Network" className="text-blue-400" />
            Character Skill Constellations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exchange earned gold coins to permanently tune your character aura, unlocking productivity multipliers and status attributes.
          </p>
        </div>
        <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg flex items-center gap-2 text-xs shrink-0 font-mono">
          <LucideIcon name="Coins" className="text-amber-400" />
          <span>COINS BALANCE: </span>
          <span className="text-amber-400 font-bold text-sm">{player.coins} Gold</span>
        </div>
      </div>

      {/* BRANCH SELECTOR BUTTONS */}
      <div className="flex flex-wrap gap-2.5">
        {categories.filter(c => ['health', 'deen', 'projects', 'knowledge', 'finance'].includes(c.id)).map((branch) => {
          const unlockedCount = skills.filter(s => s.categoryId === branch.id && s.unlocked).length;
          const totalCount = skills.filter(s => s.categoryId === branch.id).length;
          const isActive = activeBranch === branch.id;

          return (
            <button
              key={branch.id}
              onClick={() => {
                setActiveBranch(branch.id);
                setSelectedSkill(null);
              }}
              className={`px-4 py-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${isActive ? `bg-${branch.color}-950/20 border-${branch.color}-500/50 text-white shadow-lg` : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-slate-400'}`}
            >
              <span className={`p-1.5 rounded-lg bg-slate-950 border border-slate-900 ${isActive ? `text-${branch.color}-400` : 'text-slate-500'}`}>
                <LucideIcon name={branch.icon} size={15} />
              </span>
              <div className="text-left">
                <div className="text-xs font-bold font-sans uppercase tracking-wider">{branch.name} Ascendancy</div>
                <div className="text-[10px] font-mono text-slate-500">{unlockedCount} / {totalCount} Perks Unlocked</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CORE SKILL TREE BOARD & DETAIL DIALOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holographic interactive board (Left panel) */}
        <div className="lg:col-span-2 relative min-h-[400px] bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 overflow-hidden flex flex-col justify-between">
          {/* Animated matrix scanline overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_12px] pointer-events-none"></div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">Active Branch: {activeBranch.toUpperCase()} CONSTELLATION</span>
              <span className="text-[10px] text-slate-500 font-mono">Click a nodes to inspect attributes</span>
            </div>

            {/* Hierarchical levels grid */}
            <div className="space-y-12 relative z-10 py-4">
              {/* Tier 1 Row */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1 mb-4">Tier I - Initiate Perks</div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {filteredSkills.filter(s => s.tier === 1).map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`relative w-16 h-16 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${skill.unlocked ? `bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]` : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      <LucideIcon name={skill.icon} size={28} />
                      {skill.unlocked && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-slate-950 rounded-full p-0.5">
                          <LucideIcon name="Check" size={10} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier 2 Row */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1 mb-4">Tier II - Adept Mastery</div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {filteredSkills.filter(s => s.tier === 2).map((skill) => {
                    const preSkills = skill.prerequisites.map(id => skills.find(s => s.id === id));
                    const isAvailable = preSkills.every(p => p && p.unlocked);

                    return (
                      <button
                        key={skill.id}
                        disabled={false}
                        onClick={() => setSelectedSkill(skill)}
                        className={`relative w-16 h-16 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${skill.unlocked ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : isAvailable ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-slate-950 border-slate-900 text-slate-600 opacity-50'}`}
                      >
                        <LucideIcon name={skill.icon} size={28} />
                        {!isAvailable && (
                          <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-800 text-slate-500 rounded-full p-0.5">
                            <LucideIcon name="Lock" size={10} />
                          </div>
                        )}
                        {skill.unlocked && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-0.5">
                            <LucideIcon name="Check" size={10} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-3 bg-slate-900/50 border border-slate-900 rounded-xl flex items-center gap-2.5 text-[11px] text-slate-500 leading-normal font-mono">
            <LucideIcon name="Info" size={13} className="text-blue-400 shrink-0" />
            <span>Unlocking higher tiers requires first mastering initiating skills in the same path. Passive traits are locked permanently once bound.</span>
          </div>
        </div>

        {/* Selected Skill Details Card (Right panel) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col justify-between">
          {selectedSkill ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Node icon display */}
                <div className="flex gap-4 items-center">
                  <div className={`p-4 rounded-xl border ${selectedSkill.unlocked ? 'bg-blue-950/40 border-blue-500/50 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <LucideIcon name={selectedSkill.icon} size={36} />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white">{selectedSkill.name}</h3>
                    <div className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">Tier {selectedSkill.tier} Specialty</div>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">PERK ATTRIBUTION</span>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">{selectedSkill.description}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">PASSIVE EFFECTS BOUND</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedSkill.effects.map((fx, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-blue-950/40 border border-blue-900/50 text-blue-400 font-mono">
                          {fx}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedSkill.prerequisites.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">PREREQUISITE PERKS REQUIRED</span>
                      <div className="flex flex-col gap-1 mt-1.5">
                        {selectedSkill.prerequisites.map(preId => {
                          const pNode = skills.find(s => s.id === preId);
                          return (
                            <span key={preId} className={`text-xs flex items-center gap-1.5 font-mono ${pNode?.unlocked ? 'text-emerald-400' : 'text-red-400'}`}>
                              <LucideIcon name={pNode?.unlocked ? 'CheckCircle2' : 'XCircle'} size={11} />
                              {pNode?.name || preId} {pNode?.unlocked ? '(Mastered)' : '(Locked)'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-slate-800/60 pt-4 mt-6">
                {selectedSkill.unlocked ? (
                  <div className="w-full py-2.5 bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-xs font-bold font-mono rounded-lg text-center flex items-center justify-center gap-1.5">
                    <LucideIcon name="ShieldCheck" size={14} />
                    PERK PERMANENTLY BOUND
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlockClick(selectedSkill)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-550 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
                  >
                    <LucideIcon name="Unlock" size={14} />
                    Unlock Specialty for {selectedSkill.cost} Gold Coins
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 flex flex-col items-center justify-center h-full">
              <LucideIcon name="Compass" className="text-slate-700 mb-3 animate-spin" style={{ animationDuration: '6s' }} size={32} />
              <p className="text-xs font-mono">No constellation node selected.</p>
              <p className="text-[11px] text-slate-600 mt-1">Inspecting nodes displays precise attributes, costs, and passive effects.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
