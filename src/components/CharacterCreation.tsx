/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerClass } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion } from 'motion/react';
import { sfx } from '../utils/audio';

interface CharacterCreationProps {
  onStartJourney: (name: string, pClass: PlayerClass, startDate: string) => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onStartJourney }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('Warrior');
  const [startDate, setStartDate] = useState(() => {
    // Default to current local date: 2026-07-15
    return '2026-07-15';
  });
  const [error, setError] = useState('');

  const classesList: { id: PlayerClass; label: string; icon: string; color: string; bg: string; border: string; glow: string; desc: string }[] = [
    {
      id: 'Warrior',
      label: 'Warrior',
      icon: 'Shield',
      color: 'text-red-400',
      bg: 'bg-red-950/20',
      border: 'border-red-900/40 hover:border-red-500/50',
      glow: 'shadow-red-500/10',
      desc: 'Master of physical strength. Focus on workouts, healthy meals, and high endurance physical routines.'
    },
    {
      id: 'Mage',
      label: 'Mage',
      icon: 'Sparkles',
      color: 'text-blue-400',
      bg: 'bg-blue-950/20',
      border: 'border-blue-900/40 hover:border-blue-500/50',
      glow: 'shadow-blue-500/10',
      desc: 'Scholar of intellectual magic. Focus on deep study, reading goals, scripting, and language learning.'
    },
    {
      id: 'Rogue',
      label: 'Rogue',
      icon: 'Zap',
      color: 'text-purple-400',
      bg: 'bg-purple-950/20',
      border: 'border-purple-900/40 hover:border-purple-500/50',
      glow: 'shadow-purple-500/10',
      desc: 'Agile system disruptor. Focus on rapid coding, shipping side-projects, and creative content creation.'
    },
    {
      id: 'Cleric',
      label: 'Cleric',
      icon: 'Compass',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-900/40 hover:border-emerald-500/50',
      glow: 'shadow-emerald-500/10',
      desc: 'Divine keeper of early dawn. Focus on prayer congregation, spirituality, daily gratitude, and relationships.'
    },
    {
      id: 'Alchemist',
      label: 'Alchemist',
      icon: 'FlaskConical',
      color: 'text-amber-400',
      bg: 'bg-amber-950/20',
      border: 'border-amber-900/40 hover:border-amber-500/50',
      glow: 'shadow-amber-500/10',
      desc: 'Gold transmuter. Focus on tracking personal expenses, building business ideas, and optimizing formulas.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('An adventurer must have a name! Enter a name to proceed.');
      sfx.playQuestComplete(); // Play low buzz or alternative
      return;
    }
    if (name.trim().length > 20) {
      setError('Character name must be 20 characters or fewer.');
      return;
    }
    setError('');
    onStartJourney(name.trim(), selectedClass, startDate);
  };

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-600/30 selection:text-blue-300">
      
      {/* Mystical backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Scanning laser grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl bg-slate-950/70 border-2 border-blue-900/40 rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.15)] relative z-10"
      >
        {/* Ancient Sci-Fi Border Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50 rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50 rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50 rounded-br-2xl"></div>

        {/* Top Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-800/50 rounded-full text-[10px] tracking-widest text-cyan-400 font-mono font-bold uppercase shadow-[0_0_12px_rgba(34,211,238,0.2)] animate-pulse">
            <LucideIcon name="Crown" size={12} />
            NEW GAME INITIALIZATION
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-wider font-mono">
            CREATE YOUR <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">CHARACTER</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            Configure your focus lineage and synchronize your local matrix. All tracking vectors will commence at absolute zero.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Character Configuration Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Name & Start Date */}
            <div className="space-y-6">
              
              {/* Choose Your Name */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-blue-300 tracking-wider flex items-center gap-2 uppercase">
                  <LucideIcon name="User" size={14} className="text-blue-400" />
                  Choose Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter Adventurer Name..."
                    className="w-full bg-slate-900/60 border border-blue-900/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono tracking-wide shadow-inner"
                    maxLength={20}
                  />
                  <div className="absolute right-3 top-3 text-[10px] text-slate-500 font-mono">
                    {name.length}/20
                  </div>
                </div>
              </div>

              {/* Choose Journey Start Date */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-blue-300 tracking-wider flex items-center gap-2 uppercase">
                  <LucideIcon name="Calendar" size={14} className="text-emerald-400" />
                  Choose Journey Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-blue-900/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono cursor-pointer"
                  />
                  <div className="absolute right-3 top-3.5 text-[10px] text-slate-500 font-mono pointer-events-none">
                    📅
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Choose the chronological point when your saga commenced.
                </p>
              </div>

              {/* RPG Guidance Panel */}
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  <LucideIcon name="Info" size={12} />
                  Adventurer Directives
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>All levels reset to <strong className="text-white">Level 1</strong>.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>XP and Coins initialized to <strong className="text-white">0</strong>.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Demo logs, worksheets, and history records deleted.</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Right Column: Class Selection */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-blue-300 tracking-wider flex items-center gap-2 uppercase">
                <LucideIcon name="Sparkles" size={14} className="text-purple-400" />
                Select Focus Archetype
              </label>
              
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {classesList.map((cls) => {
                  const isSelected = selectedClass === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls.id);
                        sfx.playQuestComplete(); // low soft chime
                      }}
                      className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex gap-3 items-start relative ${
                        isSelected 
                          ? `${cls.bg} border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.15)]` 
                          : 'bg-slate-950/40 border-slate-900 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className={`p-2 bg-slate-950/80 border rounded-lg ${cls.color} ${isSelected ? 'border-blue-500/50' : 'border-slate-800'}`}>
                        <LucideIcon name={cls.icon} size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{cls.label}</span>
                          {isSelected && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-blue-500 text-slate-950 rounded font-bold">Selected</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{cls.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Validation Error */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/30 border border-red-900/50 rounded-xl p-3 text-xs text-red-400 font-mono text-center flex items-center justify-center gap-2"
            >
              <LucideIcon name="AlertTriangle" size={14} />
              {error}
            </motion.div>
          )}

          {/* Start Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-slate-950 font-black text-sm uppercase py-4 rounded-xl cursor-pointer hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300 tracking-wider flex items-center justify-center gap-2 relative group overflow-hidden border border-cyan-400/30"
            >
              {/* Button light shimmer effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out"></div>
              
              <LucideIcon name="Sword" size={16} className="text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>START MY JOURNEY</span>
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
};
