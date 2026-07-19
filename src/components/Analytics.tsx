/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState, Category, HistoryEntry } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion } from 'motion/react';
import { ScrollReveal, RevealStagger, RevealItem } from '../animations/ScrollReveal';
import { AnimatedCounter } from '../animations/AnimatedCounter';

interface AnalyticsProps {
  state: AppState;
}

export const Analytics: React.FC<AnalyticsProps> = ({ state }) => {
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);

  const history = state.history;
  const categories = state.categories;
  const activities = state.activities;
  const quests = state.quests;

  // 1. Calculate Consistency Score (0 - 100)
  // Formula: average completion rates of quests + streak bonus factors
  const totalDailies = quests.filter(q => q.type === 'Daily').length;
  const completedDailies = quests.filter(q => q.type === 'Daily' && q.completed).length;
  const dailyRate = totalDailies > 0 ? (completedDailies / totalDailies) * 100 : 100;
  const streakFactor = Math.min(25, state.player.currentStreak * 2.5);
  const consistencyScore = Math.min(100, Math.round(dailyRate * 0.75 + streakFactor));

  // 2. XP & Coins totals
  const totalXPGained = history.reduce((acc, current) => acc + current.xpGained, 0);
  const totalCoinsGained = history.reduce((acc, current) => acc + current.coinsGained, 0);

  // 3. Category distribution (Calculated from cleared activity volume)
  const catDistribution = categories.map(cat => {
    const totalClears = activities
      .filter(a => a.categoryId === cat.id)
      .reduce((sum, act) => sum + act.completedTimes, 0);
    return {
      name: cat.name,
      clears: totalClears,
      color: cat.color,
      icon: cat.icon
    };
  });

  const maxClears = Math.max(1, ...catDistribution.map(c => c.clears));

  // 4. Custom SVG Line Area Graph Configuration
  // Map our history points into coordinates
  const graphWidth = 600;
  const graphHeight = 200;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = () => {
    if (history.length === 0) return [];
    const maxXp = Math.max(100, ...history.map(h => h.xpGained));
    const stepX = (graphWidth - paddingX * 2) / (history.length - 1);
    
    return history.map((item, index) => {
      const x = paddingX + index * stepX;
      // invert Y since SVG coordinates start at top left (0,0)
      const y = graphHeight - paddingY - (item.xpGained / maxXp) * (graphHeight - paddingY * 2);
      return { x, y, ...item };
    });
  };

  const coords = getCoordinates();

  // Create SVG path strings for the line and filled gradient area
  let linePath = "";
  let areaPath = "";

  if (coords.length > 0) {
    linePath = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${graphHeight - paddingY} L ${coords[0].x} ${graphHeight - paddingY} Z`;
  }

  return (
    <div className="space-y-6" id="analytics-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcon name="LineChart" className="text-blue-400" />
            Character Growth Metrics & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review detailed, real-time feedback loop representations of your level climbs, discipline ratios, and daily momentum metrics.
          </p>
        </div>
      </div>

      {/* CORE STAT METERS */}
      <RevealStagger className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gauge for Consistency */}
        <RevealItem>
          <motion.div 
            whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.4)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-3 h-full"
          >
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Consistency Index</span>
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* SVG circle gauge */}
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(30, 41, 59, 0.5)" strokeWidth="8" fill="transparent" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - consistencyScore / 100) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="text-center">
                <span className="text-2xl font-bold text-slate-100 font-mono">
                  <AnimatedCounter value={consistencyScore} suffix="%" />
                </span>
                <span className="text-[9px] block text-blue-400 font-mono mt-0.5">MOMENTUM</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Streak multipliers & daily completions compound this multiplier.</p>
          </motion.div>
        </RevealItem>

        {/* XP Cache Stats */}
        <RevealItem>
          <motion.div 
            whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.4)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl flex flex-col justify-between h-full"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Total Gained XP</span>
              <div className="text-2xl font-bold text-blue-400 font-mono">
                <AnimatedCounter value={totalXPGained} prefix="+" suffix=" XP" />
              </div>
            </div>
            <div className="border-t border-slate-900 pt-3 mt-4 flex justify-between text-xs text-slate-400 font-mono">
              <span>Avg / Day:</span>
              <span className="text-white font-bold">
                <AnimatedCounter value={Math.round(totalXPGained / (history.length || 1))} suffix=" XP" />
              </span>
            </div>
          </motion.div>
        </RevealItem>

        {/* Gold Coins Stats */}
        <RevealItem>
          <motion.div 
            whileHover={{ scale: 1.02, borderColor: 'rgba(245, 158, 11, 0.4)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl flex flex-col justify-between h-full"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Total Gold Transmuted</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                <AnimatedCounter value={totalCoinsGained} prefix="+" suffix=" Gold" />
              </div>
            </div>
            <div className="border-t border-slate-900 pt-3 mt-4 flex justify-between text-xs text-slate-400 font-mono">
              <span>Avg / Day:</span>
              <span className="text-white font-bold">
                <AnimatedCounter value={Math.round(totalCoinsGained / (history.length || 1))} suffix=" G" />
              </span>
            </div>
          </motion.div>
        </RevealItem>

        {/* Prestige potential */}
        <RevealItem>
          <motion.div 
            whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.4)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl flex flex-col justify-between h-full"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Ascendancy Rank</span>
              <div className="text-xl font-bold text-slate-100 font-mono flex items-center gap-1.5">
                <LucideIcon name="Award" className="text-blue-400" />
                <span>{state.player.rank}</span>
              </div>
            </div>
            <div className="border-t border-slate-900 pt-3 mt-4 flex justify-between text-xs text-slate-400 font-mono">
              <span>Current Lvl:</span>
              <span className="text-amber-400 font-bold">
                <AnimatedCounter value={state.player.level} prefix="LVL " />
              </span>
            </div>
          </motion.div>
        </RevealItem>
      </RevealStagger>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* XP ACCUMULATION LINE GRAPH (Custom SVG) */}
        <ScrollReveal className="lg:col-span-2">
          <motion.div 
            whileHover={{ scale: 1.005, borderColor: 'rgba(59, 130, 246, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl backdrop-blur-md h-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <LucideIcon name="Activity" className="text-blue-400" />
                XP Harvest Frequency (Daily Progression)
              </h2>
              <span className="text-[10px] font-mono text-slate-500">Hover dots for timeline logs</span>
            </div>

            <div className="relative overflow-hidden w-full">
              {coords.length === 0 ? (
                <div className="py-24 text-center text-slate-500 text-xs">No progression history available yet.</div>
              ) : (
                <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto text-blue-500">
                  <defs>
                    {/* Glowing grid line gradient */}
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Vertical grid lines */}
                  {coords.map((c, i) => (
                    <line
                      key={`v-grid-${i}`}
                      x1={c.x}
                      y1={paddingY}
                      x2={c.x}
                      y2={graphHeight - paddingY}
                      stroke="rgba(30, 41, 59, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Horizontal reference lines */}
                  <line x1={paddingX} y1={paddingY} x2={graphWidth - paddingX} y2={paddingY} stroke="rgba(30, 41, 59, 0.3)" strokeWidth="1" />
                  <line x1={paddingX} y1={graphHeight / 2} x2={graphWidth - paddingX} y2={graphHeight / 2} stroke="rgba(30, 41, 59, 0.3)" strokeWidth="1" />
                  <line x1={paddingX} y1={graphHeight - paddingY} x2={graphWidth - paddingX} y2={graphHeight - paddingY} stroke="rgba(30, 41, 59, 0.8)" strokeWidth="1.5" />

                  {/* Gradient area beneath line */}
                  <motion.path 
                    d={areaPath} 
                    fill="url(#areaGrad)" 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />

                  {/* Main line path */}
                  <motion.path 
                    d={linePath} 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.3, ease: [0.25, 0.1, 0.25, 1] }}
                  />

                  {/* Interactive points */}
                  {coords.map((c, i) => (
                    <g
                      key={`pt-${i}`}
                      onMouseEnter={() => setSelectedPointIdx(i)}
                      onMouseLeave={() => setSelectedPointIdx(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={selectedPointIdx === i ? 6 : 4}
                        fill={selectedPointIdx === i ? "#60a5fa" : "#3b82f6"}
                        stroke="#0b0f19"
                        strokeWidth="2"
                      />
                    </g>
                  ))}

                  {/* Custom labels */}
                  {coords.map((c, i) => {
                    // Only render alternating or start/end dates to prevent overlap
                    if (i === 0 || i === coords.length - 1 || i === Math.floor(coords.length / 2)) {
                      return (
                        <text
                          key={`lbl-${i}`}
                          x={c.x}
                          y={graphHeight - 10}
                          fill="#64748b"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {c.date.slice(5)}
                        </text>
                      );
                    }
                    return null;
                  })}
                </svg>
              )}

              {/* Hover Tooltip Overlay */}
              {selectedPointIdx !== null && coords[selectedPointIdx] && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-blue-500/50 p-2.5 rounded-lg text-xs font-mono shadow-2xl space-y-0.5 z-20">
                  <div className="text-slate-400">Date: {coords[selectedPointIdx].date}</div>
                  <div className="text-blue-400 font-bold">XP Gained: +{coords[selectedPointIdx].xpGained} XP</div>
                  <div className="text-amber-400 font-bold">Gold Coins: +{coords[selectedPointIdx].coinsGained} G</div>
                  <div className="text-slate-300">Quests Cleared: {coords[selectedPointIdx].completedCount}</div>
                </div>
              )}
            </div>
          </motion.div>
        </ScrollReveal>

        {/* RADIAL/BAR DISCIPLINE RATIO (Custom SVG) */}
        <ScrollReveal className="lg:col-span-1">
          <motion.div 
            whileHover={{ scale: 1.01, borderColor: 'rgba(59, 130, 246, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl backdrop-blur-md flex flex-col justify-between h-full"
          >
            <div className="space-y-1 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <LucideIcon name="PieChart" className="text-blue-400" />
                Discipline Calibration Ratio
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">XP distribution based on cleared tasks</p>
            </div>

            <div className="space-y-3.5">
              {catDistribution.map((cat, i) => {
                const percentage = Math.round((cat.clears / maxClears) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">{cat.name}</span>
                      <span className="text-slate-500 font-mono">{cat.clears} clears</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-900">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(5, percentage)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-${cat.color}-500`}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* ISLAMIC / HEALTH SECTOR DETAILED ANALYTICS */}
      <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faith/Deen Analytics Log */}
        <RevealItem>
          <motion.div 
            whileHover={{ scale: 1.015, borderColor: 'rgba(16, 185, 129, 0.45)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl space-y-4 h-full"
          >
            <div className="flex gap-2.5 items-center">
              <div className="p-2 bg-emerald-950/40 border border-emerald-900/40 rounded-lg text-emerald-400">
                <LucideIcon name="Compass" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">Islamic Progress Analytics</h3>
                <p className="text-[11px] text-slate-500">Faith synchronization, prayers, and vocabulary milestones</p>
              </div>
            </div>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-slate-400">Total Congregation Prayers:</span>
                <span className="text-emerald-400 font-mono font-bold">42 clears</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-slate-400">Islamic Vocabulary Words memorized:</span>
                <span className="text-slate-200 font-mono">
                  {state.vocabularyLogs.filter(v => v.learned).length} / {state.vocabularyLogs.length} words
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Spiritual alignment score:</span>
                <span className="text-emerald-400 font-mono font-bold">High (Excellent)</span>
              </div>
            </div>
          </motion.div>
        </RevealItem>

        {/* Health/Fitness Analytics Log */}
        <RevealItem>
          <motion.div 
            whileHover={{ scale: 1.015, borderColor: 'rgba(239, 68, 68, 0.45)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl space-y-4 h-full"
          >
            <div className="flex gap-2.5 items-center">
              <div className="p-2 bg-red-950/40 border border-red-900/40 rounded-lg text-red-400">
                <LucideIcon name="Dumbbell" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">Athletic & Health Analytics</h3>
                <p className="text-[11px] text-slate-500">Physical volume records, hydration checkpoints, and aerobic sets</p>
              </div>
            </div>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-slate-400">Total Gym Clear Volume:</span>
                <span className="text-slate-200 font-mono">
                  {state.fitnessLogs.filter(f => f.activity.toLowerCase().includes('deadlift') || f.activity.toLowerCase().includes('squat')).reduce((sum, f) => sum + f.value, 0)} kg cumulative max
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-slate-400">Total Aerobic Cardio runs logged:</span>
                <span className="text-slate-200 font-mono">
                  {state.fitnessLogs.filter(f => f.activity.toLowerCase().includes('run')).length} runs logged
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Biological Cell Fasting Status:</span>
                <span className="text-amber-400 font-mono font-bold">Autophagy target queued</span>
              </div>
            </div>
          </motion.div>
        </RevealItem>
      </RevealStagger>
    </div>
  );
};
