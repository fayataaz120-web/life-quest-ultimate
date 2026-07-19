/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState, Companion } from '../types';
import { DEFAULT_COMPANIONS } from '../data/companions';
import { LucideIcon } from '../components/LucideIcon';
import { sfx } from '../utils/audio';
import { CompanionCard } from '../components/Companion/CompanionCard';
import { CompanionChat } from '../components/Companion/CompanionChat';
import { CompanionHQSettings } from '../components/Companion/CompanionHQSettings';
import { CompanionCreator } from '../components/Companion/CompanionCreator';
import { InfinityAscendantDossier } from '../components/Companion/InfinityAscendantDossier';
import { sendCompanionChatMessage } from '../services/companion';
import { LivingHeadquarters } from '../components/LivingHeadquarters';
import { motion } from 'motion/react';

interface CompanionProps {
  state: AppState;
  onUpdateState: (state: AppState) => void;
  onSetOverrideEmotion?: (emotion: string) => void;
  onTriggerMessage?: (msg: string) => void;
}

export const CompanionPage: React.FC<CompanionProps> = ({
  state,
  onUpdateState,
  onSetOverrideEmotion,
  onTriggerMessage,
}) => {
  const currentLevel = state.player.level;
  const equippedId = state.equippedCompanionId ?? 'infinity-ascendant';
  const hqThemeName = state.headquartersTheme ?? 'Small Study Room';

  // State
  const [subTab, setSubTab] = useState<'hq' | 'roster' | 'chat'>('hq');
  const [selectedCompanionId, setSelectedCompanionId] = useState<string>(equippedId);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'companion'; text: string }[]>([
    {
      sender: 'companion',
      text: 'Greetings, my friend. Speak to me of your goals, fears, or what tasks we are conquering next. I am listening.',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showCreator, setShowCreator] = useState(false);

  // Computed lists
  const allCompanions = [...DEFAULT_COMPANIONS, ...(state.customCompanions || [])];
  const selectedCompanion = allCompanions.find((c) => c.id === selectedCompanionId) || DEFAULT_COMPANIONS[0];
  const activeCompanion = allCompanions.find((c) => c.id === equippedId) || DEFAULT_COMPANIONS[0];

  const handleEquip = (id: string) => {
    const comp = allCompanions.find((c) => c.id === id);
    onUpdateState({
      ...state,
      equippedCompanionId: id,
      headquartersTheme: comp?.background || state.headquartersTheme,
    });
    setSelectedCompanionId(id);
    sfx.playLevelUp();
    if (onTriggerMessage) {
      onTriggerMessage(comp?.greeting || 'Ready to align focus!');
    }
  };

  const handleUnequip = () => {
    onUpdateState({
      ...state,
      equippedCompanionId: null,
    });
    sfx.playQuestComplete();
  };

  const handleFavorite = (id: string) => {
    let faves = [...(state.favoriteCompanionIds || [])];
    if (faves.includes(id)) {
      faves = faves.filter((fid) => fid !== id);
    } else {
      faves.push(id);
    }
    onUpdateState({ ...state, favoriteCompanionIds: faves });
    sfx.playCoin();
  };

  const handleArchive = (id: string) => {
    let archs = [...(state.archivedCompanionIds || [])];
    if (archs.includes(id)) {
      archs = archs.filter((aid) => aid !== id);
    } else {
      archs.push(id);
    }
    onUpdateState({ ...state, archivedCompanionIds: archs });
    sfx.playQuestComplete();
  };

  const handleCreateCompanion = (data: {
    name: string;
    bio: string;
    role: string;
    personality: string;
    voice: string;
    greeting: string;
    color: string;
    vfx: string[];
  }) => {
    const id = `custom-${Date.now()}`;
    const newComp: Companion = {
      id,
      name: data.name,
      biography: data.bio || 'A dedicated focus companion conjured from custom alchemical circles.',
      role: data.role,
      personality: data.personality,
      voice: data.voice,
      greeting: data.greeting,
      celebration: 'Splendid job! You completed it!',
      thinking: 'Musing over your next activities...',
      sleeping: 'Snoring in soft custom dimensions...',
      meditating: 'Centering the magic vectors...',
      quotes: {
        Happy: [data.greeting, 'Keep focused!', 'Your energy is looking wonderful!'],
        Thinking: ['Evaluating the path...', 'Let\'s structure our campaigns carefully.'],
        Greeting: [data.greeting],
      },
      colorTheme: {
        primary: data.color,
        secondary: 'slate',
        glow: data.color === 'emerald' ? '#10b981' : '#3b82f6',
        accent: '#f59e0b',
      },
      visualEffects: data.vfx,
      background: 'Small Study Room',
      music: 'Ambient Custom Lofi',
      isCustom: true,
    };

    onUpdateState({
      ...state,
      customCompanions: [...(state.customCompanions || []), newComp],
      unlockedCompanionIds: [...(state.unlockedCompanionIds || []), id],
    });

    sfx.playLevelUp();
    setShowCreator(false);
  };

  const handleSendMessage = async (message: string) => {
    setChatHistory((prev) => [...prev, { sender: 'user', text: message }]);
    setChatLoading(true);
    sfx.playSkillUnlock();

    try {
      const result = await sendCompanionChatMessage(state, activeCompanion, message);
      setChatHistory((prev) => [...prev, { sender: 'companion', text: result.reply }]);
      if (onSetOverrideEmotion && result.emotion) {
        onSetOverrideEmotion(result.emotion);
      }
      sfx.playCoin();
    } catch (err) {
      // Fallback offline dialog
      setTimeout(() => {
        const fallbackQuotes = activeCompanion.quotes.Happy || ['I am with you on this path.'];
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        const systemResponse = `[Offline projection of ${activeCompanion.name}]: I am reading your real-life metrics. You are currently level ${state.player.level} with ${state.activities.length} regimens. Do not forget to clear your daily tasks. "${randomQuote}"`;
        setChatHistory((prev) => [...prev, { sender: 'companion', text: systemResponse }]);
        setChatLoading(false);
      }, 800);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectHQTheme = (name: string) => {
    onUpdateState({
      ...state,
      headquartersTheme: name,
    });
    sfx.playCoin();
  };

  return (
    <div className="space-y-8" id="companion-manager-container">
      {/* HEADER BAR */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcon name="Sparkles" className="text-blue-400 animate-pulse" />
            Companion Guildhall & HQ Evolution
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage your companion roster, customize color elements, evolve your headquarters workspace, and converse with your companion.
          </p>
        </div>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg no-drag"
        >
          <LucideIcon name="Plus" size={13} />
          Forge Custom Companion
        </button>
      </div>

      {/* COMPANION FORGE FORM DIALOG */}
      {showCreator && <CompanionCreator onClose={() => setShowCreator(false)} onCreate={handleCreateCompanion} />}

      {/* SUB TABS BAR */}
      <div className="flex border-b border-slate-800 gap-1 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: 'hq', name: 'Headquarters Room', icon: 'Home' },
          { id: 'roster', name: 'Companion Roster', icon: 'Users' },
          { id: 'chat', name: 'Chamber Chat & Decors', icon: 'MessageSquare' },
        ].map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { sfx.playClick(); setSubTab(tab.id as any); }}
              className={`relative px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 transition-all shrink-0 ${
                isActive 
                  ? 'border-emerald-500 text-emerald-400 font-black' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <LucideIcon name={tab.icon as any} size={13} />
              <span>{tab.name}</span>
              {isActive && (
                <motion.span 
                  layoutId="subTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* CONDITIONAL SUB TAB RENDER */}
      <div className="mt-4">
        {subTab === 'hq' && (
          <LivingHeadquarters state={state} onUpdateState={onUpdateState} />
        )}

        {subTab === 'roster' && (
          <div className="space-y-6">
            <div className="bg-slate-955/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <LucideIcon name="Users" size={13} />
                Roster: Summon & Customization
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allCompanions.map((comp) => {
                  const isEquipped = comp.id === equippedId;
                  const isFavorite = state.favoriteCompanionIds?.includes(comp.id) ?? false;
                  const isArchived = state.archivedCompanionIds?.includes(comp.id) ?? false;
                  const isSelected = comp.id === selectedCompanionId;

                  return (
                    <CompanionCard
                      key={comp.id}
                      comp={comp}
                      isEquipped={isEquipped}
                      isFavorite={isFavorite}
                      isArchived={isArchived}
                      isSelected={isSelected}
                      onSelect={() => setSelectedCompanionId(comp.id)}
                      onEquip={() => handleEquip(comp.id)}
                      onUnequip={handleUnequip}
                      onFavorite={() => handleFavorite(comp.id)}
                      onArchive={() => handleArchive(comp.id)}
                    />
                  );
                })}
              </div>
            </div>

            {selectedCompanion.id === 'infinity-ascendant' ? (
              <InfinityAscendantDossier state={state} onSetOverrideEmotion={onSetOverrideEmotion} />
            ) : (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

                <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                  <LucideIcon name="Sliders" size={13} />
                  Chamber Specifications: {selectedCompanion.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-3">
                      <h3 className="text-xs font-mono text-blue-400 uppercase tracking-wider">Identity Log</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                        "{selectedCompanion.biography}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/30 border border-slate-800 p-2.5 rounded-lg">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                          Voice Output
                        </span>
                        <span className="text-slate-200 mt-1 block font-bold text-xs">{selectedCompanion.voice}</span>
                      </div>
                      <div className="bg-slate-900/30 border border-slate-800/2.5 rounded-lg">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                          Aura Harmony
                        </span>
                        <span className="text-slate-200 mt-1 block font-bold text-xs">{selectedCompanion.personality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quotes preview */}
                  <div className="space-y-3 bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl">
                    <h3 className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <LucideIcon name="Quote" size={12} />
                      Cosmic Mantras / Quote Matrices
                    </h3>
                    <div className="space-y-2.5 overflow-y-auto max-h-[160px] scrollbar-none pr-1">
                      {Object.entries(selectedCompanion.quotes)
                        .slice(0, 3)
                        .map(([emo, list]) => (
                          <div key={emo} className="border-b border-slate-900 pb-2 text-[11px]">
                            <span className="font-mono text-indigo-400 uppercase tracking-wider block mb-0.5 text-[9px]">
                              {emo} Matrix
                            </span>
                            <p className="text-slate-300 font-serif italic">"{list[0]}"</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {subTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CompanionChat
                activeCompanion={activeCompanion}
                chatHistory={chatHistory}
                chatLoading={chatLoading}
                onSendMessage={handleSendMessage}
              />
            </div>
            <div>
              <CompanionHQSettings
                currentLevel={currentLevel}
                hqThemeName={hqThemeName}
                onSelectHQ={handleSelectHQTheme}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CompanionPage;
