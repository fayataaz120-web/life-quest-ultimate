/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DifficultyLevel, QuestType } from '../types/quest';

export const getDifficultyBorder = (diff: DifficultyLevel): string => {
  switch (diff) {
    case 'Trivial':
      return 'border-slate-800 bg-slate-950/40 hover:border-slate-700';
    case 'Easy':
      return 'border-emerald-955 bg-slate-955/60 hover:border-emerald-900';
    case 'Medium':
      return 'border-blue-955 bg-slate-955/60 hover:border-blue-900/60';
    case 'Hard':
      return 'border-amber-900 bg-slate-955/80 hover:border-amber-800/80';
    case 'Legendary':
      return 'border-red-955 bg-slate-955/90 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:border-red-900/80';
    default:
      return 'border-slate-800 bg-slate-955/40';
  }
};

export const getDifficultyGlow = (diff: DifficultyLevel): string => {
  switch (diff) {
    case 'Trivial':
      return 'text-slate-500';
    case 'Easy':
      return 'text-emerald-400';
    case 'Medium':
      return 'text-blue-400';
    case 'Hard':
      return 'text-amber-500';
    case 'Legendary':
      return 'text-red-500 font-bold';
    default:
      return 'text-slate-400';
  }
};

export const calculateRewards = (diff: DifficultyLevel, type: QuestType): { xp: number; coins: number } => {
  let xp = 30;
  let coins = 10;

  // Scale based on difficulty
  switch (diff) {
    case 'Trivial':
      xp = 15;
      coins = 5;
      break;
    case 'Easy':
      xp = 30;
      coins = 10;
      break;
    case 'Medium':
      xp = 60;
      coins = 20;
      break;
    case 'Hard':
      xp = 120;
      coins = 45;
      break;
    case 'Legendary':
      xp = 300;
      coins = 120;
      break;
  }

  // Adjust factor based on type
  switch (type) {
    case 'Weekly':
      xp *= 2.5;
      coins *= 2.5;
      break;
    case 'Monthly':
      xp *= 5;
      coins *= 5;
      break;
    case 'Boss':
      xp *= 7.5;
      coins *= 7.5;
      break;
    case 'Legendary':
      xp *= 15;
      coins *= 15;
      break;
  }

  return {
    xp: Math.round(xp),
    coins: Math.round(coins),
  };
};
