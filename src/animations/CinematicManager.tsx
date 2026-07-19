/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from '../components/LucideIcon';
import { sfx } from '../utils/audio';
import { AppState } from '../types';
import avatarCosmic from '../../assets/avatar_cosmic.png';

interface CinematicManagerProps {
  state: AppState;
}

export const CinematicManager: React.FC<CinematicManagerProps> = ({ state }) => {
  const [levelUpLvl, setLevelUpLvl] = useState<number | null>(null);
  const [achievement, setAchievement] = useState<{ title: string; desc: string } | null>(null);
  const [showFirstLogin, setShowFirstLogin] = useState(false);

  // 1. Detect Level Up by tracking player level changes
  const prevLevelRef = React.useRef(state.player.level);
  useEffect(() => {
    if (state.player.level > prevLevelRef.current) {
      setLevelUpLvl(state.player.level);
      sfx.playLevelUp();
      prevLevelRef.current = state.player.level;
    }
  }, [state.player.level]);

  // 2. Listen to custom achievement unlock events
  useEffect(() => {
    const handleAchievementUnlock = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; desc: string }>;
      setAchievement(customEvent.detail);
      sfx.playAchievement();
    };

    window.addEventListener('magic-achievement-unlock', handleAchievementUnlock);
    return () => {
      window.removeEventListener('magic-achievement-unlock', handleAchievementUnlock);
    };
  }, []);

  // 3. First Login of the Day detection
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastLogin = localStorage.getItem('ultimate-quest-last-login');

    if (lastLogin !== todayStr) {
      setShowFirstLogin(true);
      sfx.playPortal();
      sfx.playGreeting();
    }
  }, []);

  const handleCloseFirstLogin = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem('ultimate-quest-last-login', todayStr);
    setShowFirstLogin(false);
  };

  const activeDailyQuestsCount = state.quests.filter(q => q.type === 'Daily' && !q.completed).length;

  return (
    <>
      <AnimatePresence>
        {/* FIRST LOGIN OF THE DAY CINEMATIC */}
        {showFirstLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg"
          >
            {/* Ambient magic particles for cinematic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center space-y-6 overflow-hidden">
              
              {/* Rotating glowing portal behind character */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  className="absolute w-36 h-36 rounded-full border border-dashed border-emerald-500/50 opacity-40 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                  className="absolute w-32 h-32 rounded-full border border-dashed border-blue-500/40 opacity-45"
                />
                
                {/* Infinity Ascendant Portrait */}
                <motion.img
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1.1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.3, stiffness: 120 }}
                  src={avatarCosmic}
                  alt="Infinity Ascendant"
                  className="w-24 h-24 object-contain z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                />
              </div>

              {/* Portal introduction */}
              <div className="space-y-2">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black"
                >
                  Cosmic Portal Opened
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl md:text-2xl font-black text-white uppercase tracking-wide font-sans"
                >
                  Infinity Ascendant Greets You
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xs text-slate-400 font-mono italic"
                >
                  "{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}"
                </motion.p>
              </div>

              {/* Today's ledger summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-3 gap-3 w-full bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl text-xs font-mono"
              >
                <div>
                  <div className="text-slate-500 uppercase text-[9px] tracking-wider mb-0.5">Active Quests</div>
                  <div className="text-blue-400 font-bold text-base">{activeDailyQuestsCount}</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[9px] tracking-wider mb-0.5">Streak</div>
                  <div className="text-rose-400 font-bold text-base">{state.player.currentStreak} Days</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[9px] tracking-wider mb-0.5">Character Lvl</div>
                  <div className="text-amber-400 font-bold text-base">LVL {state.player.level}</div>
                </div>
              </motion.div>

              {/* Motivational Scroll */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-emerald-950/10 border border-emerald-900/30 p-3.5 rounded-xl w-full text-left"
              >
                <div className="flex gap-2.5 items-start">
                  <LucideIcon name="Quote" className="text-emerald-400 shrink-0 mt-0.5" size={14} />
                  <div>
                    <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold mb-1">
                      Oracle's Daily Decree
                    </div>
                    <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                      "Real consistency is not built in the flashes of motivation, but in the quiet discipline of clearing contracts day by day."
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Enter headquarters button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                onClick={handleCloseFirstLogin}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold tracking-widest uppercase cursor-pointer shadow-lg shadow-emerald-950/20 active:scale-98 transition-all"
              >
                Enter Headquarters
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* LEVEL UP CINEMATIC OVERLAY */}
        {levelUpLvl !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/95"
          >
            {/* Spinning Magic Circle */}
            <div className="absolute w-[450px] h-[450px] md:w-[600px] md:h-[600px] flex items-center justify-center opacity-30 select-none pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/60"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-yellow-500/40"
              />
              {/* Rune characters inside the rotating wheel */}
              <div className="absolute font-mono text-[9px] text-amber-400/50 uppercase tracking-widest text-center transform scale-150">
                ⚡ INFINITY ⚔️ FOCUS 🛡️ VALOR ⚡ STRENGTH ⚔️ WISDOM 🛡️ HONOR
              </div>
            </div>

            {/* Glowing vertical light rays */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-48 h-full bg-gradient-to-b from-yellow-500/15 via-transparent to-transparent blur-[120px]" />
            </div>

            <div className="relative flex flex-col items-center text-center space-y-6 max-w-sm z-10">
              {/* Level up title */}
              <motion.div
                initial={{ scale: 0.5, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                className="space-y-1"
              >
                <div className="text-xs font-mono font-black text-yellow-500 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  Rank Accomplishment
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-sans">
                  Level Up!
                </h1>
              </motion.div>

              {/* Pulsing Lvl Indicator */}
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1.15, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.35, stiffness: 150 }}
                className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-[3px] border-slate-950 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.6)]"
              >
                <span className="text-[10px] font-mono font-black text-slate-950 uppercase tracking-widest -mb-1">
                  Reached
                </span>
                <span className="text-4xl font-black font-mono text-slate-950">
                  {levelUpLvl}
                </span>
              </motion.div>

              {/* Companion Wings/Aura descriptor */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-slate-300 leading-relaxed font-sans max-w-xs"
              >
                Your biological cells sync at a higher frequency. The focal chambers adapt, and your companion's wings expand with fresh magical vectors!
              </motion.p>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                onClick={() => setLevelUpLvl(null)}
                className="px-8 py-3.5 bg-white text-slate-950 rounded-xl text-xs font-mono font-black uppercase tracking-widest cursor-pointer shadow-xl hover:scale-103 active:scale-97 transition-all"
              >
                Absorb Aura
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ACHIEVEMENT UNLOCKED POPUP */}
        {achievement !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
          >
            {/* Constellation background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_80%)]">
              {/* Star dots lines */}
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="45%" y2="80%" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-5 overflow-hidden"
            >
              {/* Constellation border sparks */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-2xl animate-pulse">
                <LucideIcon name="Trophy" size={32} />
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-black">
                  Sigil of Legend Unlocked
                </span>
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                  {achievement.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans px-4">
                  {achievement.desc}
                </p>
              </div>

              {/* Close Achievement */}
              <button
                onClick={() => setAchievement(null)}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-mono font-bold text-xs tracking-widest uppercase rounded-xl cursor-pointer shadow-lg active:scale-98 transition-all"
              >
                Acknowledge Feat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default CinematicManager;
