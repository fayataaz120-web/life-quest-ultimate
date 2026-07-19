/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState, JourneyHistoryEntry } from '../types/journey';
import { LucideIcon } from '../components/LucideIcon';
import { sfx } from '../utils/audio';
import { JourneyCard } from '../components/Journey/JourneyCard';
import { JourneyRebirthWizard } from '../components/Journey/JourneyRebirthWizard';
import { JourneyAchievements } from '../components/Journey/JourneyAchievements';
import { ALL_ACHIEVEMENTS } from '../services/journey';

interface JourneyProps {
  state: AppState;
  viewingSnapshot: AppState | null;
  onStartNewJourney: (option: 'Fresh' | 'Rebirth', name: string) => void;
  onPauseJourney: () => void;
  onResumeJourney: () => void;
  onViewJourney: (id: string) => void;
  onRestoreJourney: (id: string) => void;
  onCloseViewSnapshot: () => void;
  onResetCurrentJourney: () => void;
}

export const JourneyPage: React.FC<JourneyProps> = ({
  state,
  viewingSnapshot,
  onStartNewJourney,
  onPauseJourney,
  onResumeJourney,
  onViewJourney,
  onRestoreJourney,
  onCloseViewSnapshot,
  onResetCurrentJourney,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [cinematicStep, setCinematicStep] = useState<'none' | 'archiving' | 'awakening'>('none');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [temporaryFreshName, setTemporaryFreshName] = useState('');

  // Active state to render
  const current = viewingSnapshot || state;
  const isReadOnly = viewingSnapshot !== null;

  const handleStartClick = () => {
    if (isReadOnly) return;
    sfx.playSkillUnlock();
    setShowWizard(true);
  };

  const handlePauseToggle = () => {
    if (isReadOnly) return;
    sfx.playSkillUnlock();
    if (state.journeyStatus === 'Active') {
      onPauseJourney();
    } else {
      onResumeJourney();
    }
  };

  const handleStartFreshJourney = (name: string) => {
    sfx.playSkillUnlock();
    setTemporaryFreshName(name);
    setShowWizard(false);
    setCinematicStep('archiving');
    setTimeout(() => {
      sfx.playLevelUp();
      setCinematicStep('awakening');
    }, 3000);
  };

  const handleAwakenNewEra = () => {
    sfx.playLevelUp();
    onStartNewJourney('Fresh', temporaryFreshName || `Chapter ${state.journeyNumber + 1}: The Quest Continues`);
    setCinematicStep('none');
  };

  const handleExecuteRebirth = () => {
    onStartNewJourney('Rebirth', '');
    setShowWizard(false);
  };

  // Stats calculation
  const totalCompletedQuests = current.quests.filter((q) => q.completed).length;
  const xpPct = Math.min(100, Math.round((current.player.xp / current.player.xpToNextLevel) * 100));

  return (
    <div className="space-y-8 animate-fadeIn" id="journey-ledger-hub">
      {/* VIEWING SNAPSHOT WARNING BAR */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
              <LucideIcon name="History" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">HISTORICAL VIEWING MODE (READ-ONLY)</h4>
              <p className="text-xs text-amber-400/80 font-sans">
                You are browsing Chapter {current.journeyNumber}: "{current.journeyName}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                sfx.playLevelUp();
                onRestoreJourney(current.journeyNumber.toString());
              }}
              className="flex-1 sm:flex-none cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <LucideIcon name="ChevronUpSquare" size={14} />
              Restore Journey
            </button>
            <button
              onClick={onCloseViewSnapshot}
              className="flex-1 sm:flex-none cursor-pointer bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <LucideIcon name="X" size={14} />
              Back to Active
            </button>
          </div>
        </div>
      )}

      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-blue-400 font-mono uppercase">
            Guild Registry
          </span>
          <h2 className="text-2xl font-black text-white tracking-wide">JOURNEY & LEGACY LEDGER</h2>
          <p className="text-xs text-slate-400 font-sans">
            Archiving your heroic milestones across lifetimes and chapters.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Pause/Resume button */}
            <button
              onClick={handlePauseToggle}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                state.journeyStatus === 'Paused'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30'
                  : 'bg-amber-950/20 border-amber-500/30 text-amber-400 hover:bg-amber-950/30'
              }`}
            >
              <LucideIcon name={state.journeyStatus === 'Paused' ? 'Play' : 'Pause'} size={14} />
              <span>{state.journeyStatus === 'Paused' ? 'Resume Journey' : 'Pause Journey'}</span>
            </button>

            {/* Reset Current Journey */}
            <button
              onClick={() => {
                sfx.playSkillUnlock();
                setShowResetConfirm(true);
              }}
              className="px-4 py-2 cursor-pointer bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/35 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <LucideIcon name="RefreshCw" size={14} />
              <span>Reset Current Journey</span>
            </button>

            {/* Start New Journey */}
            <button
              onClick={handleStartClick}
              className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
            >
              <LucideIcon name="PlusCircle" size={14} />
              <span>Start New Journey</span>
            </button>
          </div>
        )}
      </div>

      {/* CORE SPLIT: CURRENT ACTIVE VS LIFETIME LEGACY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CURRENT JOURNEY STATUS CARD */}
        <div className="bg-slate-955/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Title bar */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl">
                <LucideIcon name="Compass" size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-505 font-mono uppercase tracking-wider">
                  CURRENT CHAPTER PROGRESS
                </span>
                <h3 className="text-base font-black text-white">{current.journeyName}</h3>
              </div>
            </div>

            {/* Status indicators */}
            <span
              className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider font-mono border ${
                current.journeyStatus === 'Active'
                  ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400 animate-pulse'
                  : current.journeyStatus === 'Paused'
                  ? 'bg-amber-950/30 border-amber-500/20 text-amber-400'
                  : 'bg-slate-950/30 border-slate-800 text-slate-400'
              }`}
            >
              {current.journeyStatus}
            </span>
          </div>

          {/* Stats details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-900/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 font-mono block">JOURNEY LEVEL</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-amber-400">{current.player.level}</span>
                <span className="text-[10px] text-slate-505 font-mono">Lvl</span>
              </div>
              <div className="w-full bg-slate-955 h-1 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${xpPct}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900/55 border border-slate-900/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 font-mono block">JOURNEY GOLD</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-yellow-400">{current.player.coins}</span>
                <span className="text-[10px] text-slate-505 font-mono">Coins</span>
              </div>
            </div>

            <div className="bg-slate-900/55 border border-slate-900/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-505 font-mono block">STREAK</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-red-400 flex items-center gap-0.5">
                  <LucideIcon name="Flame" size={16} className="text-red-505 animate-pulse" />
                  {current.player.currentStreak}D
                </span>
                <span className="text-[10px] text-slate-505 font-mono">/ {current.player.longestStreak}Max</span>
              </div>
            </div>
          </div>

          {/* Journey Statistics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider font-mono uppercase">
              Current Journey Statistics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/20 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                  <LucideIcon name="CheckSquare" size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-505 block font-sans">Quests Done</span>
                  <span className="text-xs font-black text-slate-200">
                    {current.journeyStatistics?.questsCompleted || 0}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
                  <LucideIcon name="Dumbbell" size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-505 block font-sans">Activities</span>
                  <span className="text-xs font-black text-slate-200">
                    {current.journeyStatistics?.activitiesCompleted || 0}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <LucideIcon name="BookOpen" size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-505 block font-sans">Books Read</span>
                  <span className="text-xs font-black text-slate-200">
                    {current.journeyStatistics?.booksRead || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Summary preview */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider font-mono uppercase">
                Chapter Achievements
              </h4>
              <span className="text-xs font-mono font-bold text-blue-400">
                {current.journeyAchievements?.length || 0} / {ALL_ACHIEVEMENTS.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_ACHIEVEMENTS.slice(0, 4).map((ach) => {
                const unlocked = current.journeyAchievements?.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    title={`${ach.name}: ${ach.desc}`}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      unlocked
                        ? `${ach.color} opacity-100 scale-100`
                        : 'border-slate-900/60 text-slate-600 bg-slate-950/20 opacity-40 hover:opacity-60 scale-95'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <LucideIcon name={ach.icon} size={15} />
                    </div>
                    <div className="text-[9px] font-black truncate leading-tight">{ach.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LIFETIME LEGACY CARD */}
        <div className="bg-slate-955/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Title bar */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/15 text-purple-400 rounded-xl">
                <LucideIcon name="ShieldAlert" size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-505 font-mono uppercase tracking-wider">
                  LIFETIME LEGACY
                </span>
                <h3 className="text-base font-black text-white">Ancient Guild Records</h3>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400 font-mono bg-purple-950/20 border border-purple-500/10 px-2 py-1 rounded-full uppercase">
              <LucideIcon name="Sparkles" size={10} />
              LEGACY UNLOCKED
            </div>
          </div>

          {/* Lifetime stats columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/55 border border-slate-900/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-505 font-mono block">LIFETIME XP</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-purple-400">
                  {(current.lifetimeXp || 0) + current.player.xp}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">XP</span>
              </div>
            </div>

            <div className="bg-slate-900/55 border border-slate-900/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 font-mono block">LIFETIME COINS</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-yellow-400">
                  {(current.lifetimeCoins || 0) + current.player.coins}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Coins</span>
              </div>
            </div>

            <div className="bg-slate-900/55 border border-slate-900/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 font-mono block">COMPLETED JOURNEYS</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-indigo-400">
                  {current.lifetimeStatistics?.totalJourneysCompleted || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Chapters</span>
              </div>
            </div>
          </div>

          {/* Lifetime Statistics Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider font-mono uppercase">
              Lifetime Statistics Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/20 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
                  <LucideIcon name="Target" size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-505 block font-sans">Total Quests</span>
                  <span className="text-xs font-black text-slate-200">
                    {(current.lifetimeStatistics?.totalQuestsCompleted || 0) + totalCompletedQuests}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                  <LucideIcon name="Flame" size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-505 block font-sans">Active Days</span>
                  <span className="text-xs font-black text-slate-200">
                    {current.lifetimeStatistics?.totalDaysActive || 1}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <LucideIcon name="Briefcase" size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-505 block font-sans">Skills Unlocked</span>
                  <span className="text-xs font-black text-slate-200">
                    {(current.lifetimeStatistics?.totalSkillsUnlocked || 0) +
                      (current.skills?.filter((s) => s.unlocked).length || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JOURNEY CHRONICLES TABLE */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6">
        <div>
          <h3 className="text-base font-black text-white">Journey Chronicles History</h3>
          <p className="text-xs text-slate-400 font-sans">
            Detailed historical registry of all your previous full chapters.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-900">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-405 border-b border-slate-900 font-mono text-[10px] tracking-wider uppercase">
                <th className="p-4 font-bold">Chapter</th>
                <th className="p-4 font-bold">Journey Name</th>
                <th className="p-4 font-bold">Time Period</th>
                <th className="p-4 font-bold text-center">Highest Level</th>
                <th className="p-4 font-bold text-center">Longest Streak</th>
                <th className="p-4 font-bold text-center">Books</th>
                <th className="p-4 font-bold text-center">Languages</th>
                <th className="p-4 font-bold text-center">Achievements</th>
                <th className="p-4 font-bold text-center">Completion</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.journeyHistory?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-500 font-mono">
                    <div className="flex flex-col items-center gap-2">
                      <LucideIcon name="History" size={24} className="text-slate-600" />
                      <span>No completed chapters archived in the chronicles ledger yet.</span>
                      <span className="text-[10px] text-slate-600 font-sans">
                        Start a new journey above to split and archive your first chapter!
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                current.journeyHistory.map((j: JourneyHistoryEntry) => (
                  <JourneyCard
                    key={j.id}
                    j={j}
                    isReadOnly={isReadOnly}
                    onView={onViewJourney}
                    onRestore={onRestoreJourney}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER FULL ACHIEVEMENTS SECTION */}
      <JourneyAchievements
        journeyAchievements={current.journeyAchievements || []}
        lifetimeAchievements={current.lifetimeAchievements || []}
        legacyBadges={current.legacyBadges || []}
      />

      {/* START NEW JOURNEY WIZARD MODAL */}
      {showWizard && (
        <JourneyRebirthWizard
          journeyNumber={state.journeyNumber}
          totalCompletedQuests={totalCompletedQuests}
          state={state}
          onClose={() => setShowWizard(false)}
          onStartFreshJourney={handleStartFreshJourney}
          onExecuteRebirth={handleExecuteRebirth}
        />
      )}

      {/* PREMIUM ANIME CINEMATIC JOURNEY STARTER */}
      {cinematicStep !== 'none' && (
        <div className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden animate-fadeIn">
          {/* Subtle Ambient Glowing Background Orbs */}
          <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 animate-pulse pointer-events-none"></div>
          <div className="absolute w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] top-1/2 right-1/3 -translate-y-1/2 translate-x-1/2 animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Animated Background Star Dust lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {cinematicStep === 'archiving' && (
            <div className="space-y-8 max-w-md relative z-10 flex flex-col items-center animate-[pulse_2s_infinite]">
              {/* Spinning runic gear */}
              <div className="w-24 h-24 border-2 border-dashed border-amber-500/30 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                <div className="w-16 h-16 border border-dotted border-blue-400/40 rounded-full animate-[spin_10s_linear_infinite_reverse] flex items-center justify-center">
                  <LucideIcon name="History" size={24} className="text-amber-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-bold font-mono tracking-[0.25em] text-amber-400 uppercase">CHRONICLE CONSOLIDATION</h3>
                <h2 className="text-2xl font-black text-white tracking-tight">Archiving Previous Deeds</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Safely sealing your Level {state.player.level} achievements, completed logs, and quest statistics inside the Ancient Legacy Ledger...
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-48 bg-slate-900/60 h-1.5 border border-slate-800 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full w-full animate-[loading_3s_ease-in-out_infinite]"></div>
              </div>
            </div>
          )}

          {cinematicStep === 'awakening' && (
            <div className="space-y-10 max-w-xl relative z-10 flex flex-col items-center animate-[fadeIn_0.8s_ease]">
              {/* Celestial Companion Ascension Motif */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute w-full h-full border border-dashed border-emerald-500/20 rounded-full animate-[spin_40s_linear_infinite]"></div>
                <div className="absolute w-5/6 h-5/6 border border-dotted border-violet-500/25 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="absolute w-20 h-20 bg-gradient-to-tr from-emerald-500/20 via-violet-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
                <div className="relative z-10 p-5 bg-slate-955/40 border border-slate-800/85 rounded-full text-emerald-400 shadow-2xl backdrop-blur-sm animate-[bounce_4s_ease-in-out_infinite]">
                  <LucideIcon name="Sparkles" size={44} className="animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <span className="px-3 py-1 bg-blue-955/50 border border-blue-500/30 text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase rounded-full">
                  COSMIC REBIRTH SUCCESSFUL
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none uppercase">
                  CHAPTER {state.journeyNumber + 1} AWAKENS
                </h2>
                <h3 className="text-sm font-bold text-slate-300 italic font-serif">
                  "{temporaryFreshName || `Chapter ${state.journeyNumber + 1}: The Quest Continues`}"
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
                  Your physical records have been cleansed. You awaken as a Level 1 Seeker. However, your legendary soul, badges, and chronicles are forever preserved in the halls of starlight.
                </p>
              </div>

              <button
                onClick={handleAwakenNewEra}
                className="group relative cursor-pointer px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition-all uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-500/25 border border-blue-400/20 hover:scale-[1.05]"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
                <span className="relative">Step Into the Portal</span>
                <LucideIcon name="Compass" size={14} className="relative animate-spin" style={{ animationDuration: '6s' }} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESET CURRENT JOURNEY CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                sfx.playSkillUnlock();
                setShowResetConfirm(false);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
            >
              <LucideIcon name="X" size={20} />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                <LucideIcon name="TriangleAlert" size={24} className="animate-bounce" />
                <h4 className="text-base font-black text-white font-sans">RESET CURRENT JOURNEY</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                This will reset all progress in your current chapter (<strong className="text-slate-300">"{state.journeyName}"</strong>) back to the beginning. 
              </p>
              <ul className="text-xs text-slate-500 list-disc list-inside space-y-1 font-sans">
                <li>Current level resets to 1 (0 XP)</li>
                <li>Coins balance resets to 0</li>
                <li>All active quests and activities reset to incomplete</li>
                <li>All skill nodes are locked</li>
                <li>Logs (books, fitness, journals, etc.) for this chapter are deleted</li>
              </ul>
              <p className="text-xs text-red-400/80 font-bold font-sans">
                Your character name, class, and previous archived journey histories will be preserved.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    sfx.playSkillUnlock();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 cursor-pointer bg-slate-900 border border-slate-800 text-slate-400 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sfx.playLevelUp();
                    onResetCurrentJourney();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 cursor-pointer bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  Yes, Reset Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default JourneyPage;
