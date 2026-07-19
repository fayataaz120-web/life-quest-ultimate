/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, Quest, Category, Activity, PlayerClass, HistoryEntry, AppState } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';
import { DEFAULT_COMPANIONS } from '../data/companions';
import { motion } from 'motion/react';
import { ScrollReveal, RevealStagger, RevealItem } from '../animations/ScrollReveal';
import { AnimatedCounter } from '../animations/AnimatedCounter';
import steampunk3D from '../../assets/steampunk_3d.png';
import infinity3D from '../../assets/infinity_3d.png';
import avatarDjinn from '../../assets/avatar_djinn.png';
import avatarCelestial from '../../assets/avatar_celestial.png';
import avatarCosmic from '../../assets/avatar_cosmic.png';

interface DashboardProps {
  player: PlayerProfile;
  categories: Category[];
  activities: Activity[];
  quests: Quest[];
  history: HistoryEntry[];
  onUpdatePlayer: (updated: Partial<PlayerProfile>) => void;
  onCompleteQuest: (id: string) => void;
  state: AppState;
}

// Motivational quotes array
const MYSTICAL_QUOTES = [
  { text: "Consistency is the ultimate mana. Let not the sloth of today drain the reservoir of tomorrow.", author: "Archmage of Focus" },
  { text: "A legendary weapon is not forged in a single minute, but in ten thousand strokes of the hammer.", author: "Master Blacksmith Thorne" },
  { text: "The battle with one's soul in the quiet dawn is the most critical skirmish of the entire campaign.", author: "Grand Paladin of Deen" },
  { text: "To master a tongue, to shape a project, to build a domain... these are the paths to divine tier ascension.", author: "Scrollkeeper Alistair" },
  { text: "Let your health be your fortress, and your mind the commander who keeps its gates.", author: "Warlord of Health" }
];

export const Dashboard: React.FC<DashboardProps> = ({
  player,
  categories,
  activities,
  quests,
  history,
  onUpdatePlayer,
  onCompleteQuest,
  state,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MYSTICAL_QUOTES.length));
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarAnim, setAvatarAnim] = useState('');
  const prevAvatarId = useRef(player.equippedAvatarId);

  useEffect(() => {
    if (player.equippedAvatarId !== prevAvatarId.current) {
      setAvatarAnim('animate-[portal-enter_0.8s_ease-out]');
      const timer = setTimeout(() => setAvatarAnim(''), 800);
      prevAvatarId.current = player.equippedAvatarId;
      return () => clearTimeout(timer);
    }
  }, [player.equippedAvatarId]);

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      if (scrollTop > lastScrollTop.current && scrollTop > 15) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollTop.current = scrollTop;

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrollingDown(false);
      }, 250);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0);
    const diffMs = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);
    return { hours, minutes, seconds };
  });

  useEffect(() => {
    const calculateTimeUntilReset = () => {
      const now = new Date();
      const resetTime = new Date();
      resetTime.setHours(24, 0, 0, 0);
      const diffMs = resetTime.getTime() - now.getTime();
      if (diffMs <= 0) {
        return { hours: 24, minutes: 0, seconds: 0 };
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);
      return { hours, minutes, seconds };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeUntilReset());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const dayName = currentDateTime.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = currentDateTime.getDate();
  const monthName = currentDateTime.toLocaleDateString('en-US', { month: 'long' });
  const yearNum = currentDateTime.getFullYear();
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const getJourneyDay = () => {
    if (!player.journeyStartDate) return 1;
    const start = new Date(player.journeyStartDate);
    const today = new Date(currentDateTime);
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };
  const journeyDay = getJourneyDay();

  const completedQuestsCount = quests.filter(q => q.completed).length;
  const [isXpPulsing, setIsXpPulsing] = useState(false);
  const prevCompletedCountRef = useRef(completedQuestsCount);

  useEffect(() => {
    if (completedQuestsCount > prevCompletedCountRef.current) {
      setIsXpPulsing(true);
      const timer = setTimeout(() => {
        setIsXpPulsing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevCompletedCountRef.current = completedQuestsCount;
  }, [completedQuestsCount]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdatePlayer({ name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleClassChange = (newClass: PlayerClass) => {
    onUpdatePlayer({ class: newClass });
    sfx.playSkillUnlock();
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdatePlayer({ title: newTitle });
    sfx.playSkillUnlock();
  };

  // Calculations for dashboard summary
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayQuests = quests.filter(q => q.type === 'Daily');
  const completedToday = todayQuests.filter(q => q.completed).length;
  const totalToday = todayQuests.length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 100;

  // Level XP percentage
  const xpPercentage = Math.min(100, Math.round((player.xp / player.xpToNextLevel) * 100));

  // Determine avatar visual based on Class
  const getAvatarVisual = (pClass: PlayerClass) => {
    switch (pClass) {
      case 'Warrior':
        return {
          icon: 'Shield',
          color: 'from-red-600 to-amber-700',
          shadow: 'shadow-red-500/20 border-red-500/50',
          badge: 'text-red-400 bg-red-950/40 border-red-800/60',
          desc: 'Frontline executor. Excel at health, physical records, and manual labor.'
        };
      case 'Mage':
        return {
          icon: 'Sparkles',
          color: 'from-blue-600 to-indigo-700',
          shadow: 'shadow-blue-500/20 border-blue-500/50',
          badge: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
          desc: 'Aura collector. Focuses on deep intellectual blocks, scripts, and languages.'
        };
      case 'Rogue':
        return {
          icon: 'Zap',
          color: 'from-purple-600 to-pink-700',
          shadow: 'shadow-purple-500/20 border-purple-500/50',
          badge: 'text-purple-400 bg-purple-950/40 border-purple-800/60',
          desc: 'Agile opportunist. Excel at coding, side-projects, and content delivery.'
        };
      case 'Cleric':
        return {
          icon: 'Compass',
          color: 'from-emerald-600 to-teal-700',
          shadow: 'shadow-emerald-500/20 border-emerald-500/50',
          badge: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
          desc: 'Divine keeper. Excel at Deen, spirituality, relationships, and service.'
        };
      case 'Alchemist':
        return {
          icon: 'FlaskConical',
          color: 'from-amber-500 to-yellow-600',
          shadow: 'shadow-amber-500/20 border-amber-500/50',
          badge: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
          desc: 'Gold transmuter. Focuses on finance, business, micro-habits, and formulas.'
        };
      default:
        return {
          icon: 'Shield',
          color: 'from-red-600 to-amber-700',
          shadow: 'shadow-red-500/20 border-red-500/50',
          badge: 'text-red-400 bg-red-950/40 border-red-800/60',
          desc: 'Frontline executor. Excel at health, physical records, and manual labor.'
        };
    }
  };

  const avStyle = getAvatarVisual(player.class);

  // Generate simple 28-day grid ending on current date for the compact heatmap
  const getHeatmapDays = () => {
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      // find history entry or count matching completed quests/activities
      const hist = history.find(h => h.date === str);
      const intensity = hist ? Math.min(4, Math.ceil(hist.xpGained / 80)) : 0;
      days.push({ date: str, intensity, xp: hist ? hist.xpGained : 0 });
    }
    return days;
  };

  const heatmapDays = getHeatmapDays();

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* 1. TOP STATUS PANEL: Elite Adventurer Status Screen */}
      <div className="relative bg-slate-900/60 border border-blue-900/40 rounded-xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]" id="profile-card">
        {/* Decorative corner highlights */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg"></div>

        {/* Top Left Compass/Cross Emblem */}
        <div className="absolute top-4 left-4 p-1.5 bg-slate-950/80 border border-blue-900/30 rounded-lg text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.15)] z-20">
          <LucideIcon name="Compass" size={13} className="animate-[spin_20s_linear_infinite]" />
        </div>

        {/* Dynamic Date & Time Chronometer */}
        <div className="md:absolute md:top-6 md:right-6 flex items-center gap-3 bg-slate-950/60 border border-blue-900/40 px-3.5 py-1.5 rounded-xl backdrop-blur-md font-mono text-xs shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-500/50 transition-all duration-300 w-full md:w-auto justify-between md:justify-end mb-4 md:mb-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-950/50 border border-blue-900/40 rounded-lg text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
              <LucideIcon name="Clock" size={14} className="animate-pulse" />
            </div>
            <div className="text-left md:text-right">
              <span className="text-[9px] text-slate-500 font-bold block leading-none tracking-wider uppercase">{dayName}</span>
              <span className="text-xs text-slate-200 block font-bold leading-none mt-1">{dayNum} {monthName} {yearNum}</span>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-blue-900/20 hidden md:block"></div>
          <div className="text-right">
            <span className="text-[9px] text-blue-400 block tracking-wider font-bold leading-none uppercase">Journey Day {journeyDay}</span>
            <span className="text-xs font-black text-cyan-400 leading-none mt-1 block drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
              {formattedTime}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Full-body companion character container */}
          <div className="relative flex flex-col items-center justify-end shrink-0 w-36 h-52 sm:w-48 sm:h-64 md:w-56 md:h-76 mt-2 md:-mt-20 md:-mb-6 select-none z-10" id="dashboard-full-body-companion">
            {/* Swap Avatar Overlay Button */}
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-all cursor-pointer shadow-lg z-20"
              title="Change Character Portrait"
            >
              <LucideIcon name="Sparkles" size={11} />
            </button>

            {/* Swirling spell circle at feet */}
            {(() => {
              const equippedId = state?.equippedCompanionId ?? 'infinity-ascendant';
              const companions = [...DEFAULT_COMPANIONS, ...(state?.customCompanions || [])];
              const companion = companions.find(c => c.id === equippedId) || DEFAULT_COMPANIONS[0];
              
              // Determine active visual model
              const avatarId = player.equippedAvatarId || 'cosmic';
              let avatarSrc = avatarCosmic;
              let scaleClass = 'scale-115';
              let glowColor = companion?.colorTheme?.glow || '#10b981';
              
              if (equippedId === 'steampunk-sentinel') {
                avatarSrc = steampunk3D;
                scaleClass = 'scale-110';
                glowColor = '#fbbf24';
              } else {
                if (avatarId === 'celestial') {
                  avatarSrc = avatarCelestial;
                  scaleClass = 'scale-110';
                  glowColor = '#f59e0b';
                } else if (avatarId === 'djinn') {
                  avatarSrc = avatarDjinn;
                  scaleClass = 'scale-110';
                  glowColor = '#06b6d4';
                }
              }
              
              return (
                <>
                  {/* Pulsing Backlight Glow */}
                  <div 
                    className="absolute bottom-12 w-32 h-32 rounded-full blur-[40px] opacity-35 animate-pulse pointer-events-none z-0" 
                    style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
                  ></div>

                  {/* Floating magical particles (stardust) */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full opacity-40 animate-[float-particle_4s_linear_infinite]"
                        style={{
                          left: `${15 + i * 15}%`,
                          bottom: '15px',
                          animationDelay: `${i * 0.7}s`,
                          animationDuration: `${3.5 + (i % 3)}s`,
                          backgroundColor: glowColor,
                          boxShadow: `0 0 6px ${glowColor}`
                        }}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-2 w-[110%] h-6 rounded-full opacity-60 pointer-events-none z-0">
                    <svg viewBox="0 0 100 20" className="w-full h-full animate-[spin_15s_linear_infinite]" style={{ transformOrigin: '50px 10px' }}>
                      <ellipse cx="50" cy="10" rx="44" ry="7" fill="none" stroke={glowColor} strokeWidth="0.8" strokeDasharray="3 3" />
                      <ellipse cx="50" cy="10" rx="34" ry="5.5" fill="none" stroke={glowColor} strokeWidth="0.5" />
                    </svg>
                  </div>
                  
                  {/* The character image or fallback SVG */}
                  <div 
                    className={`relative w-full h-[90%] flex items-center justify-center z-10 animate-[breath_6s_ease-in-out_infinite] ${avatarAnim}`} 
                    style={{ 
                      transformOrigin: 'bottom center',
                      transform: isScrollingDown ? 'scale(1.02) rotate(3deg) translateY(6px)' : 'scale(1) rotate(0deg) translateY(0px)',
                      transition: 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)'
                    }}
                  >
                    <img 
                      src={avatarSrc} 
                      alt="Companion Avatar" 
                      className={`max-w-full max-h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] transform ${scaleClass}`} 
                    />
                  </div>
                </>
              );
            })()}

            {/* Level indicator badge at feet */}
            <div className="relative z-20 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-mono font-black px-3.5 py-0.5 rounded border border-slate-950 shadow-[0_4px_10px_rgba(0,0,0,0.5)] text-[10px] tracking-wider -mt-1 select-none">
              LVL {player.level}
            </div>
          </div>

          {/* Profile details */}
          <div className="flex-1 space-y-3 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-slate-950/80 border border-blue-500 text-white px-3 py-1 rounded-lg text-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                    maxLength={20}
                  />
                  <button onClick={handleSaveName} className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs">
                    <LucideIcon name="Check" size={16} />
                  </button>
                  <button onClick={() => { setTempName(player.name); setIsEditingName(false); }} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-gray-400 text-xs">
                    <LucideIcon name="X" size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white font-sans">{player.name}</h1>
                  <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-blue-400 transition-colors p-1">
                    <LucideIcon name="Edit" size={14} />
                  </button>
                </div>
              )}

              {/* Class Badge & Selector */}
              <div className="relative group">
                <div className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${avStyle.badge} flex items-center gap-1 cursor-pointer hover:bg-slate-800/80`}>
                  <span>Class: {player.class}</span>
                  <LucideIcon name="ChevronDown" size={12} />
                </div>
                {/* Class dropdown on hover/click */}
                <div className="hidden group-hover:block absolute left-0 mt-1 bg-slate-950 border border-blue-900/60 rounded-lg p-2 shadow-2xl z-20 w-44">
                  {(['Warrior', 'Mage', 'Rogue', 'Cleric', 'Alchemist'] as PlayerClass[]).map((cls) => (
                    <button
                      key={cls}
                      onClick={() => handleClassChange(cls)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${cls === player.class ? 'bg-blue-900/30 text-blue-300' : 'text-gray-400 hover:bg-slate-900 hover:text-white'}`}
                    >
                      <span>{cls}</span>
                      {cls === player.class && <LucideIcon name="Check" size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title Selector */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-xs text-gray-400">Current Title:</span>
              <select
                value={player.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-slate-950/80 border border-blue-900/50 text-amber-400 font-mono text-xs rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {player.unlockedTitles.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <span className="text-slate-500 px-1">|</span>

              <span className="text-xs text-gray-400 flex items-center gap-1">
                <LucideIcon name="Award" size={12} className="text-blue-400" />
                Rank: <span className="text-blue-300 font-bold">{player.rank}</span>
              </span>

              <span className="text-slate-500 px-1">|</span>

              <span className="text-xs text-gray-400 flex items-center gap-1" title={`Journey started on ${player.journeyStartDate || 'today'}`}>
                <LucideIcon name="Calendar" size={12} className="text-emerald-400" />
                Journey Day: <span className="text-emerald-300 font-bold">{journeyDay}</span>
              </span>
            </div>

            {/* XP PROGRESS BAR */}
            <div className="space-y-1">
              <div className="flex justify-between items-end text-xs font-mono">
                <span className={`flex items-center gap-1 transition-colors duration-300 ${isXpPulsing ? 'text-cyan-400 font-bold drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]' : 'text-blue-300'}`}>
                  <LucideIcon name="Sparkles" size={12} className={isXpPulsing ? 'animate-bounce' : 'animate-pulse'} />
                  XP Progression
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-bold">{player.xp}</span> / {player.xpToNextLevel} ({xpPercentage}%)
                </span>
              </div>
              <div className={`h-3 w-full bg-slate-950 rounded-full border overflow-hidden relative p-[1px] transition-all duration-300 ${isXpPulsing ? 'border-blue-400 animate-xp-breath' : 'border-blue-950/80'}`}>
                {/* Glowing fluid bar */}
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 transition-all duration-700 ease-out ${isXpPulsing ? 'shadow-[0_0_12px_rgba(59,130,246,0.9)] brightness-110' : 'shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}
                  style={{ width: `${xpPercentage}%` }}
                ></div>
                {/* Internal scanlines effect */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_100%]"></div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <RevealStagger className="grid grid-cols-2 gap-3 w-full md:w-auto min-w-[200px]" id="quick-stats-grid">
            <RevealItem>
              <motion.div 
                whileHover={{ scale: 1.02, borderColor: 'rgba(245, 158, 11, 0.45)', boxShadow: '0 0 15px rgba(245, 158, 11, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-slate-950/60 border border-blue-900/30 p-3 rounded-lg flex items-center gap-3 h-full cursor-default"
              >
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <LucideIcon name="Coins" size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono">GOLD COINS</div>
                  <div className="text-lg font-bold text-amber-400 font-mono"><AnimatedCounter value={player.coins} /></div>
                </div>
              </motion.div>
            </RevealItem>

            <RevealItem>
              <motion.div 
                whileHover={{ scale: 1.02, borderColor: 'rgba(239, 68, 68, 0.45)', boxShadow: '0 0 15px rgba(239, 68, 68, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-slate-950/60 border border-blue-900/30 p-3 rounded-lg flex items-center gap-3 h-full cursor-default"
              >
                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                  <LucideIcon name="Flame" size={20} className="animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono">STREAK</div>
                  <div className="text-lg font-bold text-red-400 font-mono"><AnimatedCounter value={player.currentStreak} /> Days</div>
                </div>
              </motion.div>
            </RevealItem>

            <RevealItem>
              <motion.div 
                whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.45)', boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-slate-950/60 border border-blue-900/30 p-3 rounded-lg flex items-center gap-3 h-full cursor-default"
              >
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <LucideIcon name="Trophy" size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono">MAX STREAK</div>
                  <div className="text-md font-bold text-purple-300 font-mono"><AnimatedCounter value={player.longestStreak} /> Days</div>
                </div>
              </motion.div>
            </RevealItem>

            <RevealItem>
              <motion.div 
                whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.45)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-slate-950/60 border border-blue-900/30 p-3 rounded-lg flex items-center gap-3 h-full cursor-default"
              >
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <LucideIcon name="RefreshCw" size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono">PRESTIGE</div>
                  <div className="text-md font-bold text-emerald-300 font-mono">Tier <AnimatedCounter value={player.prestige} /></div>
                </div>
              </motion.div>
            </RevealItem>
          </RevealStagger>
        </div>

        {/* Short Class description */}
        <div className="mt-4 text-xs text-slate-400 border-t border-slate-800/40 pt-3 italic text-center md:text-left flex items-center gap-2">
          <LucideIcon name="Info" size={13} className="text-blue-500 inline" />
          <span>{avStyle.desc}</span>
        </div>
      </div>

      {/* 2. THREE-PANEL CORE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Today's Quests & NPC Dialogue Box */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Quests */}
          <ScrollReveal>
            <motion.div 
              whileHover={{ scale: 1.01, borderColor: 'rgba(59, 130, 246, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(59, 130, 246, 0.03)' }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-lg" 
              id="todays-quests-dashboard"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/40">
                <div className="flex items-center gap-2">
                  <LucideIcon name="Compass" className="text-blue-400" />
                  <div>
                    <h2 className="text-md font-bold text-white">Active Daily Quests</h2>
                    <p className="text-[10px] text-slate-400">Complete daily tasks to protect your active streak.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Reset Countdown Timer */}
                  <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-950/30 border border-rose-900/40 px-2.5 py-1 rounded-lg">
                    <LucideIcon name="Clock" size={12} className="animate-pulse" />
                    <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">Reset in:</span>
                    <span className="font-bold tracking-tight">
                      {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                  {/* Completion tracker */}
                  <span className="text-xs font-mono text-blue-300 bg-blue-950/50 border border-blue-900/50 px-2.5 py-1 rounded-lg">
                    COMPLETION: {completionRate}%
                  </span>
                </div>
              </div>

              {todayQuests.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  No active dailies for today. Go to the Quest Board to add or start one!
                </div>
              ) : (
                <div className="space-y-3">
                  {todayQuests.map((quest) => {
                    const cat = categories.find(c => c.id === quest.categoryId);
                    const colorClass = cat ? cat.color : 'blue';
                    return (
                      <div
                        key={quest.id}
                        className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${quest.completed ? 'bg-slate-950/40 border-emerald-900/40 opacity-70' : 'bg-slate-950/80 border-slate-800 hover:border-blue-900/60'}`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => !quest.completed && onCompleteQuest(quest.id)}
                            disabled={quest.completed}
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${quest.completed ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 cursor-default' : 'border-slate-600 hover:border-blue-500 bg-slate-900 cursor-pointer'}`}
                          >
                            {quest.completed && <LucideIcon name="Check" size={14} />}
                          </button>

                          <div>
                            <div className={`text-sm font-medium ${quest.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {quest.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 max-w-md">{quest.description}</div>
                            
                            {/* Quest meta details */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {cat && (
                                <span className={`text-[10px] px-2 py-0.5 rounded bg-${colorClass}-950/40 border border-${colorClass}-800/60 text-${colorClass}-400 font-mono`}>
                                  {cat.name}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded font-mono">
                                Difficulty: {quest.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rewards */}
                        <div className="text-right font-mono text-[11px] shrink-0">
                          <div className="text-blue-400 font-bold">+{quest.xpReward} XP</div>
                          <div className="text-amber-400 font-bold">+{quest.coinsReward} COINS</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </ScrollReveal>

          {/* NPC Dialogue & Motivation Module */}
          <ScrollReveal delay={0.1}>
            <motion.div 
              whileHover={{ scale: 1.01, borderColor: 'rgba(59, 130, 246, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(59, 130, 246, 0.03)' }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden bg-slate-950/80 border border-blue-900/20 rounded-xl p-5" 
              id="npc-motivation"
            >
              <div className="absolute top-0 right-0 p-3 flex gap-2">
                <button
                  onClick={() => setQuoteIndex((prev) => (prev + 1) % MYSTICAL_QUOTES.length)}
                  className="text-slate-500 hover:text-blue-400 p-1 cursor-pointer"
                  title="Summon another wisdom scroll"
                >
                  <LucideIcon name="RotateCw" size={14} />
                </button>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400 shrink-0">
                  <LucideIcon name="Scroll" size={24} />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">Wisdom Scroll of Ascent</div>
                  <p className="text-sm text-slate-300 italic font-serif leading-relaxed">
                    "{MYSTICAL_QUOTES[quoteIndex].text}"
                  </p>
                  <div className="text-[11px] font-mono text-amber-500">— {MYSTICAL_QUOTES[quoteIndex].author}</div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>

        </div>

        {/* RIGHT COLUMN: Quick Category XP Summary & Heatmap */}
        <div className="space-y-6">
          
          {/* Category Progress Level Board */}
          <ScrollReveal delay={0.05}>
            <motion.div 
              whileHover={{ scale: 1.01, borderColor: 'rgba(59, 130, 246, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(59, 130, 246, 0.03)' }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-lg" 
              id="category-summary-dashboard"
            >
              <h2 className="text-md font-bold text-white flex items-center gap-2 mb-4">
                <LucideIcon name="BookOpen" className="text-blue-400" />
                Real Life Sectors
              </h2>

              <div className="space-y-3">
                {categories.slice(0, 6).map((cat) => {
                  // Count active activities in this sector
                  const catActs = activities.filter(a => a.categoryId === cat.id);
                  const activeCount = catActs.filter(a => a.status === 'Active').length;
                  const compTimes = catActs.reduce((acc, current) => acc + current.completedTimes, 0);

                  return (
                    <div key={cat.id} className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 bg-${cat.color}-950/40 border border-${cat.color}-900/40 text-${cat.color}-400 rounded`}>
                            <LucideIcon name={cat.icon} size={13} />
                          </span>
                          <span className="text-slate-300 font-semibold">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {activeCount} active • {compTimes} total clears
                        </span>
                      </div>

                      {/* Progress representation */}
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-900 rounded-full overflow-hidden">
                          {/* We can animate the width of sector progress bars */}
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(100, Math.max(10, (compTimes * 2.5)))}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-${cat.color}-500`}
                          ></motion.div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0 uppercase">
                          MULT: {cat.xpMultiplier}x
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Compact Calendar Heatmap */}
          <ScrollReveal delay={0.1}>
            <motion.div 
              whileHover={{ scale: 1.01, borderColor: 'rgba(59, 130, 246, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(59, 130, 246, 0.03)' }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-lg" 
              id="compact-heatmap-dashboard"
            >
              <h2 className="text-md font-bold text-white flex items-center gap-2 mb-2">
                <LucideIcon name="Calendar" className="text-blue-400" />
                Adventurer Momentum
              </h2>
              <p className="text-[11px] text-slate-400 mb-3">Daily XP generation frequency (Last 28 days)</p>

              <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                {heatmapDays.map((day) => {
                  // map intensity to coloring scale
                  let color = "bg-slate-950 border-slate-900";
                  if (day.intensity === 1) color = "bg-blue-950 border-blue-900 text-blue-400";
                  if (day.intensity === 2) color = "bg-blue-900/60 border-blue-800 text-blue-300";
                  if (day.intensity === 3) color = "bg-blue-700/80 border-blue-600 text-blue-100";
                  if (day.intensity >= 4) color = "bg-blue-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(59,130,246,0.4)]";

                  return (
                    <div
                      key={day.date}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold font-mono border ${color}`}
                      title={`${day.date}: ${day.xp} XP Earned`}
                    >
                      {new Date(day.date).getDate()}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-mono">
                <span>Sloth (0 XP)</span>
                <div className="flex gap-1 items-center">
                  <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-900 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-900 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded bg-blue-700/80 border border-blue-600 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded bg-blue-500 border border-cyan-400 inline-block"></span>
                </div>
                <span>Legend (320+ XP)</span>
              </div>
            </motion.div>
          </ScrollReveal>

        </div>

      </div>

      {/* 4. AVATAR PORTRAIT PICKER MODAL */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-[scaleUp_0.2s_ease-out]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
                <LucideIcon name="Sparkles" className="text-amber-400 animate-pulse" size={18} />
                Select Character Portrait
              </h3>
              <button 
                onClick={() => setShowAvatarPicker(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6">
              {[
                { 
                  id: 'cosmic' as const, 
                  name: 'Cosmic Archmage', 
                  desc: 'Clean celestial sorcerer wielding high focus magic.', 
                  img: avatarCosmic 
                },
                { 
                  id: 'celestial' as const, 
                  name: 'Celestial Sentinel', 
                  desc: 'The original guardian standing on runic circles.', 
                  img: avatarCelestial 
                },
                { 
                  id: 'djinn' as const, 
                  name: 'Arcane Djinn', 
                  desc: 'A mystical spirit forge focusing on deep energy block tasks.', 
                  img: avatarDjinn 
                }
              ].map((av) => {
                const isSel = (player.equippedAvatarId || 'cosmic') === av.id;
                return (
                  <div 
                    key={av.id}
                    onClick={() => {
                      sfx.playCoin();
                      onUpdatePlayer({ equippedAvatarId: av.id });
                      setShowAvatarPicker(false);
                    }}
                    className={`border rounded-2xl p-2.5 flex flex-col justify-between gap-3 text-center cursor-pointer transition-all hover:scale-[1.03] hover:bg-slate-800/40 ${isSel ? 'border-amber-500 bg-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-800 bg-slate-950/50'}`}
                  >
                    <div className="h-28 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/80 p-1 relative">
                      <img src={av.img} alt={av.name} className="max-h-full object-contain" />
                      {isSel && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow-md">
                          <LucideIcon name="Check" size={10} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-200 block truncate">{av.name}</span>
                      <p className="text-[8px] text-slate-400 leading-tight mt-1 line-clamp-2">{av.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center text-[9px] text-slate-500 font-mono">
              Portraits represent your active visual identity on the dashboard stats card.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
