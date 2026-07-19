/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HQTheme } from '../types/companion';

export const HQ_THEMES: HQTheme[] = [
  {
    name: "Small Study Room",
    minLevel: 1,
    description: "A cozy, humble starter chamber with wooden shelves, a glowing candle, and a single study desk. The perfect starting point of your journey.",
    icon: "Home",
    colorClass: "from-slate-950 via-slate-900 to-indigo-950/20",
    weatherOptions: ["Quiet Sun", "Soft Rain"]
  },
  {
    name: "Magic Library",
    minLevel: 5,
    description: "An infinite cathedral of knowledge with massive oak shelves. Ancient leather tomes float in mid-air, casting soft light trails.",
    icon: "BookOpen",
    colorClass: "from-slate-950 via-slate-950 to-emerald-950/30",
    weatherOptions: ["Arcane Blizzard", "Golden Leaves"]
  },
  {
    name: "Arcane Academy",
    minLevel: 10,
    description: "A high-vaulted laboratory lined with vials, alchemical crucibles, and chalkboards depicting complex runic equations.",
    icon: "Award",
    colorClass: "from-slate-950 via-slate-900 to-violet-950/30",
    weatherOptions: ["Mana Drizzle", "Quiet Sun"]
  },
  {
    name: "Sky Temple",
    minLevel: 15,
    description: "An open-air marble sanctuary floating high above the clouds. Crystal prisms refract solar energy into colored beams.",
    icon: "Compass",
    colorClass: "from-sky-950 via-slate-950 to-amber-950/10",
    weatherOptions: ["Celestial Wind", "Golden Rain"]
  },
  {
    name: "Celestial Palace",
    minLevel: 25,
    description: "A legendary fortress built of solid starlight and celestial gold plates. Constellations slowly cycle on the ceiling.",
    icon: "Crown",
    colorClass: "from-indigo-950 via-slate-950 to-purple-950/40",
    weatherOptions: ["Cosmic Storm", "Starlight Shower"]
  },
  {
    name: "Astral Observatory",
    minLevel: 40,
    description: "A state-of-the-art observatory at the edge of the galaxy, floating among nebula clouds and a giant cosmic portal.",
    icon: "Sparkles",
    colorClass: "from-slate-950 via-indigo-950/50 to-black",
    weatherOptions: ["Space Distortion", "Aurora Borealis"]
  }
];

export interface CompanionStageInfo {
  stage: number;
  title: string;
  desc: string;
  auraIntensity: 'low' | 'medium' | 'high' | 'intense' | 'supreme';
  hasWings: boolean;
  hasFloatingAccessories: boolean;
  hasAdvancedVfx: boolean;
}

/**
 * Calculates companion stage stats based on user level.
 */
export const getCompanionStageInfo = (level: number): CompanionStageInfo => {
  if (level < 10) {
    return {
      stage: 1,
      title: "The Seeker",
      desc: "A humble focus apprentice in basic garments, absorbing the initial sparks of consistency.",
      auraIntensity: "low",
      hasWings: false,
      hasFloatingAccessories: false,
      hasAdvancedVfx: false
    };
  } else if (level < 20) {
    return {
      stage: 2,
      title: "The Astral Vanguard",
      desc: "A dedicated guardian wearing polished copper pauldrons, backed by simple swirling mana vectors.",
      auraIntensity: "medium",
      hasWings: true,
      hasFloatingAccessories: false,
      hasAdvancedVfx: false
    };
  } else if (level < 30) {
    return {
      stage: 3,
      title: "The Celestial Scholar",
      desc: "A wise focused guide holding floating crystal shards and glowing wing feathers.",
      auraIntensity: "high",
      hasWings: true,
      hasFloatingAccessories: true,
      hasAdvancedVfx: true
    };
  } else if (level < 40) {
    return {
      stage: 4,
      title: "The Seraph of Will",
      desc: "An advanced cosmic protector backed by rotating runic equations and a floating tome of wisdom.",
      auraIntensity: "intense",
      hasWings: true,
      hasFloatingAccessories: true,
      hasAdvancedVfx: true
    };
  } else {
    return {
      stage: 5,
      title: "The Sovereign of Infinity",
      desc: "A legendary cosmic sovereign at the peak of absolute focus, wrapped in cascading galaxy vortexes.",
      auraIntensity: "supreme",
      hasWings: true,
      hasFloatingAccessories: true,
      hasAdvancedVfx: true
    };
  }
};

/**
 * Async API Call to communicate with the interactive companion chat backend.
 */
export const sendCompanionChatMessage = async (
  state: any,
  companion: any,
  message: string
): Promise<{ reply: string; emotion: string }> => {
  try {
    const res = await fetch('/api/companion-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state, companion, message }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status: ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply,
      emotion: data.emotion || 'Happy',
    };
  } catch (error: any) {
    console.error("Failed to send companion chat message:", error);
    throw error;
  }
};
