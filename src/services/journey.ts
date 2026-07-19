/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Achievement, LegacyBadge } from '../types/journey';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'lvl-5', name: 'Initiate Ascent', desc: 'Reach Level 5 in a single journey.', icon: 'ArrowUpCircle', color: 'text-emerald-400 border-emerald-950 bg-emerald-950/10' },
  { id: 'lvl-10', name: 'Adept Sentinel', desc: 'Reach Level 10 in a single journey.', icon: 'Award', color: 'text-teal-400 border-teal-950 bg-teal-950/10' },
  { id: 'lvl-15', name: 'Focus Master', desc: 'Reach Level 15 in a single journey.', icon: 'Crown', color: 'text-amber-400 border-amber-950 bg-amber-950/10' },
  { id: 'lvl-20', name: 'Ascendant Deity', desc: 'Reach Level 20 in a single journey.', icon: 'Sparkles', color: 'text-purple-400 border-purple-950 bg-purple-950/10' },
  { id: 'streak-3', name: 'Consistent Spark', desc: 'Maintain a 3-day active streak.', icon: 'Flame', color: 'text-orange-400 border-orange-950 bg-orange-950/10' },
  { id: 'streak-7', name: 'Habitual Guardian', desc: 'Maintain a 7-day active streak.', icon: 'Zap', color: 'text-yellow-400 border-yellow-950 bg-yellow-950/10' },
  { id: 'streak-14', name: 'Undefeated Champion', desc: 'Maintain a 14-day active streak.', icon: 'ShieldAlert', color: 'text-red-400 border-red-950 bg-red-950/10' },
  { id: 'quest-1', name: 'First Bounty', desc: 'Complete 1 quest in a single journey.', icon: 'Compass', color: 'text-sky-400 border-sky-950 bg-sky-950/10' },
  { id: 'quest-5', name: 'Quest Squire', desc: 'Complete 5 quests in a single journey.', icon: 'CheckSquare', color: 'text-blue-400 border-blue-950 bg-blue-950/10' },
  { id: 'quest-10', name: 'Guild Champion', desc: 'Complete 10 quests in a single journey.', icon: 'Trophy', color: 'text-indigo-400 border-indigo-950 bg-indigo-950/10' },
  { id: 'book-1', name: 'Literary Seeker', desc: 'Complete 1 book log in a single journey.', icon: 'BookOpen', color: 'text-pink-400 border-pink-950 bg-pink-950/10' },
  { id: 'book-3', name: 'Scrollmaster', desc: 'Complete 3 book logs in a single journey.', icon: 'Library', color: 'text-rose-400 border-rose-950 bg-rose-950/10' },
  { id: 'skill-1', name: 'First Inscription', desc: 'Unlock 1 skill node.', icon: 'Network', color: 'text-indigo-400 border-indigo-950 bg-indigo-950/10' },
  { id: 'skill-3', name: 'Constellation Novice', desc: 'Unlock 3 skill nodes.', icon: 'Grid', color: 'text-violet-400 border-violet-950 bg-violet-950/10' },
];

export const ALL_LIFETIME_ACHIEVEMENTS: Achievement[] = [
  { id: 'lt-xp-1k', name: 'XP Pioneer', desc: 'Amass 1,000 lifetime XP.', icon: 'Layers', color: 'text-emerald-400 border-emerald-950 bg-emerald-950/10' },
  { id: 'lt-xp-5k', name: 'XP Overlord', desc: 'Amass 5,000 lifetime XP.', icon: 'Cpu', color: 'text-teal-400 border-teal-950 bg-teal-950/10' },
  { id: 'lt-quest-1', name: 'First Milestone', desc: 'Complete your first lifetime quest.', icon: 'Flag', color: 'text-sky-400 border-sky-950 bg-sky-950/10' },
  { id: 'lt-quest-5', name: 'Elite Hunter', desc: 'Complete 5 lifetime quests.', icon: 'Target', color: 'text-blue-400 border-blue-950 bg-blue-950/10' },
  { id: 'lt-quest-25', name: 'Legendary Hero', desc: 'Complete 25 lifetime quests.', icon: 'Sword', color: 'text-amber-400 border-amber-950 bg-amber-950/10' },
  { id: 'lt-book-1', name: 'Scholar Initiate', desc: 'Read 1 lifetime book.', icon: 'Book', color: 'text-pink-400 border-pink-950 bg-pink-950/10' },
  { id: 'lt-book-5', name: 'Sovereign Scholar', desc: 'Read 5 lifetime books.', icon: 'Bookmark', color: 'text-purple-400 border-purple-950 bg-purple-950/10' },
];

export const ALL_LEGACY_BADGES: LegacyBadge[] = [
  { id: 'badge-pioneer', name: 'Pioneer Badge', desc: 'Completed your first full journey.', icon: 'HeartHandshake', color: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30' },
  { id: 'badge-phoenix', name: 'Phoenix Rebirth Badge', desc: 'Completed 3 full journeys and resurrected.', icon: 'Flame', color: 'from-orange-600/20 to-red-600/10 text-orange-400 border-orange-500/30' },
  { id: 'badge-titan', name: 'Legacy Titan', desc: 'Completed a journey with Level 15+.', icon: 'Shield', color: 'from-purple-600/20 to-indigo-600/10 text-purple-400 border-purple-500/30' },
];
