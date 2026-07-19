/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AppState } from '../types';
import { LucideIcon } from './LucideIcon';
import { setGlobalWeather, WeatherTheme } from '../animations/WeatherSystem';
import { sfx } from '../utils/audio';

interface LivingHeadquartersProps {
  state: AppState;
  onUpdateState: (state: AppState) => void;
}

export const LivingHeadquarters: React.FC<LivingHeadquartersProps> = ({ state, onUpdateState }) => {
  // 1. Calculations for Room Tiers
  // Library: vocabulary logs + book logs
  const libraryScore = (state.vocabularyLogs?.filter(v => v.learned).length || 0) + (state.bookLogs?.length || 0);
  const libraryTier = libraryScore === 0 ? 0 : libraryScore < 3 ? 1 : libraryScore < 6 ? 2 : 3;

  // Training Grounds: fitness logs count
  const fitnessScore = state.fitnessLogs?.length || 0;
  const trainingTier = fitnessScore === 0 ? 0 : fitnessScore < 3 ? 1 : fitnessScore < 6 ? 2 : 3;

  // Magic Hall: skill nodes unlocked
  const magicScore = state.skills?.filter(s => s.unlocked).length || 0;
  const magicTier = magicScore === 0 ? 0 : magicScore < 3 ? 1 : magicScore < 6 ? 2 : 3;

  // Creator Studio: project logs + business ideas
  const creatorScore = (state.projectLogs?.length || 0) + (state.businessIdeaLogs?.length || 0);
  const creatorTier = creatorScore === 0 ? 0 : creatorScore < 2 ? 1 : creatorScore < 4 ? 2 : 3;

  // Garden: consistency streak
  const streak = state.player.currentStreak;
  const gardenTier = streak === 0 ? 0 : streak < 3 ? 1 : streak < 7 ? 2 : 3;

  // Observatory: history ledger counts
  const historyScore = state.history?.length || 0;
  const observatoryTier = historyScore === 0 ? 0 : historyScore < 5 ? 1 : historyScore < 12 ? 2 : 3;

  // Hall of Legends: level scale
  const lvl = state.player.level;
  const legendsTier = lvl < 10 ? 0 : lvl < 20 ? 1 : lvl < 30 ? 2 : 3;

  // 2. Weather Controls handler
  const handleWeatherChange = (theme: WeatherTheme) => {
    sfx.playClick();
    setGlobalWeather(theme);
    
    // Also save in state for reactive checks
    onUpdateState({
      ...state,
      headquartersTheme: theme,
    });
  };

  const weatherOptions: WeatherTheme[] = [
    'Clear Night',
    'Rain',
    'Snow',
    'Fog',
    'Aurora',
    'Floating Lanterns',
    'Magic Storm',
  ];

  // 3. Current Day / Night cycle details
  const localHour = new Date().getHours();
  const getDayNightCycle = () => {
    if (localHour >= 6 && localHour < 12) return { name: 'Morning Ascent', desc: 'Warm ambient sunlight fills the headquarters, speed multipliers active.', color: 'text-amber-400', icon: 'Sunrise' };
    if (localHour >= 12 && localHour < 17) return { name: 'Bright Zenith', desc: 'Sovereign skies shine bright, maximizing real life productivity.', color: 'text-sky-400', icon: 'Sun' };
    if (localHour >= 17 && localHour < 20) return { name: 'Twilight Sunset', desc: 'Golden purple hues cast shadows, relaxing mental strain.', color: 'text-orange-400', icon: 'Sunset' };
    return { name: 'Midnight Aether', desc: 'Stars twinkle and magic circle hums with increased night glow.', color: 'text-indigo-400', icon: 'Moon' };
  };
  const cycle = getDayNightCycle();

  return (
    <div className="space-y-6" id="living-hq-container">
      
      {/* TIME OF DAY & WEATHER SELECTION HEADER */}
      <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className={`${cycle.color} animate-pulse`}>
              <LucideIcon name={cycle.icon as any} size={18} />
            </span>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-slate-400">
              Day & Night Cycle: {cycle.name}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{cycle.desc}</p>
        </div>

        {/* WEATHER CONTROL PAD */}
        <div className="space-y-2 w-full lg:w-auto shrink-0">
          <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Headquarters Weather Controls
          </span>
          <div className="flex flex-wrap gap-1.5">
            {weatherOptions.map((opt) => {
              const isActive = (state.headquartersTheme || 'Clear Night') === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleWeatherChange(opt)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase cursor-pointer border transition-all ${
                    isActive
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* HQ INTERACTIVE ROOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. LIBRARY */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-blue-950/40 border border-blue-900/40 rounded-xl text-blue-400">
                <LucideIcon name="BookOpen" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Tier {libraryTier}/3
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">The Grand Library</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {libraryTier === 0 && 'An empty study shelf waiting for ancient vocabulary scrolls.'}
              {libraryTier === 1 && 'A modest wooden bookcase containing basic memorized logs and reading sheets.'}
              {libraryTier === 2 && 'An elite archive decorated with rows of leather grimoires.'}
              {libraryTier === 3 && 'A magnificent floating Wizard Library with glowing scrolls and books!'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 bg-blue-950/20 px-2 py-1 rounded border border-blue-900/30 w-fit">
            <LucideIcon name="Book" size={11} />
            <span>{libraryScore} Artifacts Logged</span>
          </div>
        </motion.div>

        {/* 2. TRAINING GROUNDS */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-red-950/40 border border-red-900/40 rounded-xl text-red-400">
                <LucideIcon name="Dumbbell" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Tier {trainingTier}/3
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Training Yards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {trainingTier === 0 && 'A simple patch of sand. Commit to physical activity to construct workout gear.'}
              {trainingTier === 1 && 'A straw training post with simple dumbbells and weight sets.'}
              {trainingTier === 2 && 'An upgraded gymnasium with punching bags and iron barbells.'}
              {trainingTier === 3 && 'A legendary Gladiator Arena complete with custom squat cages and steel benches!'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 bg-red-950/20 px-2 py-1 rounded border border-red-900/30 w-fit">
            <LucideIcon name="Flame" size={11} />
            <span>{fitnessScore} Workouts Registered</span>
          </div>
        </motion.div>

        {/* 3. MAGIC HALL */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-purple-950/40 border border-purple-900/40 rounded-xl text-purple-400">
                <LucideIcon name="Network" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Tier {magicTier}/3
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Arcane Sanctum</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {magicTier === 0 && 'A dark room awaiting magic circle activation. Unlock skills to light the sigils.'}
              {magicTier === 1 && 'A faint glowing rune circle on the floor, pulsating with blue energy.'}
              {magicTier === 2 && 'A complex set of rotating orbital dials tracking your skill tree nodes.'}
              {magicTier === 3 && 'A supreme magical gate crackling with purple lightning and floating runic keys!'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400 bg-purple-950/20 px-2 py-1 rounded border border-purple-900/30 w-fit">
            <LucideIcon name="Sparkles" size={11} />
            <span>{magicScore} Skills Acquired</span>
          </div>
        </motion.div>

        {/* 4. CREATOR STUDIO */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-indigo-950/40 border border-indigo-900/40 rounded-xl text-indigo-400">
                <LucideIcon name="Edit" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Tier {creatorTier}/3
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Creator Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {creatorTier === 0 && 'An empty workspace. Log project and business tasks to forge equipment.'}
              {creatorTier === 1 && 'A drawing desk with half-rolled parchment blueprints and layout sketches.'}
              {creatorTier === 2 && 'An advanced workspace fitted with painters easels and alchemical flasks.'}
              {creatorTier === 3 && 'A master alchemical laboratory filled with paints, desk monitors, and blueprints!'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 bg-indigo-950/20 px-2 py-1 rounded border border-indigo-900/30 w-fit">
            <LucideIcon name="Layers" size={11} />
            <span>{creatorScore} Creative Feats</span>
          </div>
        </motion.div>

        {/* 5. GREENHOUSE GARDEN */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/40 rounded-xl text-emerald-400">
                <LucideIcon name="Compass" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Tier {gardenTier}/3
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Citadel Conservatory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {gardenTier === 0 && 'Dry soil patches. Establish a daily quest completion streak to grow seeds.'}
              {gardenTier === 1 && 'A tiny sprout poking through soil, reacting to your active streak.'}
              {gardenTier === 2 && 'Vibrant green vines wrapping around the pillars, blooming with leaves.'}
              {gardenTier === 3 && 'A magnificent lush greenhouse packed with glowing emerald lotus blossoms!'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30 w-fit">
            <LucideIcon name="Flame" size={11} />
            <span>{streak} Day Consistent Streak</span>
          </div>
        </motion.div>

        {/* 6. OBSERVATORY */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-cyan-950/40 border border-cyan-900/40 rounded-xl text-cyan-400">
                <LucideIcon name="Star" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Tier {observatoryTier}/3
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Aether Observatory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {observatoryTier === 0 && 'A closed skylight. Log daily history entries to unlock glass lenses.'}
              {observatoryTier === 1 && 'An open viewport displaying a single bright star in a dark void.'}
              {observatoryTier === 2 && 'A spinning bronze telescope observing the glimmering Orion nebula.'}
              {observatoryTier === 3 && 'A glowing astronomical dome showing active constellations in full orbit!'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-1 rounded border border-cyan-900/30 w-fit">
            <LucideIcon name="Calendar" size={11} />
            <span>{historyScore} History logs mapped</span>
          </div>
        </motion.div>

        {/* 7. HALL OF LEGENDS */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-amber-950/40 border border-amber-900/40 rounded-xl text-amber-400">
                <LucideIcon name="Award" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Tier {legendsTier}/3
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Hall of Legends</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {legendsTier === 0 && 'An empty lobby. Reach higher player levels to erect commemorative statues.'}
              {legendsTier === 1 && 'A plaque of copper commemorating your entrance to the guild.'}
              {legendsTier === 2 && 'A bronze warrior statue wielding an oathkeeper focus blade.'}
              {legendsTier === 3 && 'A colossal golden monument holding an Infinity Sword and glowing crest!'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30 w-fit">
            <LucideIcon name="Crown" size={11} />
            <span>Character Level {lvl} Reached</span>
          </div>
        </motion.div>

        {/* 8. COMPANION CHAMBER */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[230px]"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/40 rounded-xl text-emerald-400">
                <LucideIcon name="Users" size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Chamber
              </span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Companion Chamber</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Where your unlocked roster resides. Evolve and manage focus guides. Currently equipped guide floats at your side.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30 w-fit">
            <LucideIcon name="Sparkles" size={11} />
            <span>{state.unlockedCompanionIds?.length || 1} Guides Summoned</span>
          </div>
        </motion.div>
        
      </div>
      
    </div>
  );
};
export default LivingHeadquarters;
