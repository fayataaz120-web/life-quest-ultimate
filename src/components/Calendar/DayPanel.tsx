/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, Category } from '../../types';
import { Mission, DailyNote, DailyJournal } from '../../types/calendar';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';
import { Timeline } from './Timeline';
import { NotesEditor } from './NotesEditor';
import { JournalEditor } from './JournalEditor';

interface DayPanelProps {
  dateStr: string;
  state: AppState;
  categories: Category[];
  missions: Mission[];
  note?: DailyNote;
  journal?: DailyJournal;
  streak: number;
  journeyDay: number;
  onClose: () => void;
  onPlanQuestClick: () => void;
  onCompleteQuest: (questId: string) => void;
  onDeleteQuest: (questId: string) => void;
  onEditQuest: (quest: Mission) => void;
  onSaveNote: (dateStr: string, note: DailyNote) => void;
  onSaveJournal: (dateStr: string, journal: DailyJournal) => void;
}

type PanelTab = 'missions' | 'timeline' | 'notes' | 'journal';

export const DayPanel: React.FC<DayPanelProps> = ({
  dateStr,
  state,
  categories,
  missions,
  note,
  journal,
  streak,
  journeyDay,
  onClose,
  onPlanQuestClick,
  onCompleteQuest,
  onDeleteQuest,
  onEditQuest,
  onSaveNote,
  onSaveJournal,
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('missions');
  const [energyLevel, setEnergyLevel] = useState<number>(() => {
    // Read energy level from state, notes or default to 3
    return 3;
  });

  const weatherName = state.headquartersTheme || 'Clear Night';
  const getWeatherIcon = (themeName: string) => {
    if (themeName === 'Rain') return 'CloudRain' as const;
    if (themeName === 'Snow') return 'CloudSnow' as const;
    if (themeName === 'Fog') return 'Cloud' as const;
    if (themeName === 'Aurora') return 'Sparkles' as const;
    if (themeName === 'Floating Lanterns') return 'Moon' as const;
    if (themeName === 'Magic Storm') return 'Zap' as const;
    return 'Sun' as const;
  };

  const handleEnergySelect = (lvl: number) => {
    sfx.playClick();
    setEnergyLevel(lvl);
    
    // Auto-save energy to current notes reflection
    const currentNote: DailyNote = note || {};
    onSaveNote(dateStr, {
      ...currentNote,
      reflection: `${currentNote.reflection || ''}\n[Energy: ${lvl}/5]`.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[900] flex justify-end">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 cursor-pointer"
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg bg-slate-950 border-l border-slate-900 shadow-2xl z-[901] flex flex-col h-full font-mono text-xs"
      >
        
        {/* PANEL HEADER */}
        <div className="p-5 border-b border-slate-900 bg-slate-950/40 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-950 border border-indigo-900 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                  Day #{journeyDay}
                </span>
                <span className="text-[10px] bg-rose-950 border border-rose-900 text-rose-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <LucideIcon name="Flame" size={9} />
                  {streak} Days
                </span>
              </div>
              <h2 className="text-base font-black text-white uppercase tracking-wider mt-1.5">
                {new Date(dateStr + 'T00:00:00Z').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <LucideIcon name="X" size={16} />
            </button>
          </div>

          {/* Quick HUD values (Weather & Energy) */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/25 border border-slate-900/60 p-3 rounded-2xl">
            {/* Weather indicator */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-amber-500">
                <LucideIcon name={getWeatherIcon(weatherName)} size={15} />
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block uppercase font-black leading-none">HQ Weather</span>
                <span className="text-[10px] text-slate-300 font-bold leading-normal">{weatherName}</span>
              </div>
            </div>

            {/* Energy slider capsules */}
            <div className="space-y-1">
              <span className="text-[8px] text-slate-500 block uppercase font-black">Energy Level</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleEnergySelect(lvl)}
                    className={`flex-1 h-3 rounded cursor-pointer transition-all ${
                      lvl <= energyLevel
                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900 border border-slate-850 hover:bg-slate-850'
                    }`}
                    title={`Level ${lvl}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DRAWER SUB TABS */}
        <div className="flex border-b border-slate-900 font-black uppercase tracking-wider text-[10px]">
          <button
            onClick={() => { sfx.playClick(); setActiveTab('missions'); }}
            className={`flex-1 py-3.5 text-center cursor-pointer border-b-2 transition-all ${
              activeTab === 'missions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            Quests ({missions.length})
          </button>
          <button
            onClick={() => { sfx.playClick(); setActiveTab('timeline'); }}
            className={`flex-1 py-3.5 text-center cursor-pointer border-b-2 transition-all ${
              activeTab === 'timeline' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => { sfx.playClick(); setActiveTab('notes'); }}
            className={`flex-1 py-3.5 text-center cursor-pointer border-b-2 transition-all ${
              activeTab === 'notes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            Planner Note
          </button>
          <button
            onClick={() => { sfx.playClick(); setActiveTab('journal'); }}
            className={`flex-1 py-3.5 text-center cursor-pointer border-b-2 transition-all ${
              activeTab === 'journal' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            Reflection
          </button>
        </div>

        {/* CONTAINER CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-none space-y-4">
          
          {/* TAB 1: MISSIONS LIST */}
          {activeTab === 'missions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Planned Contracts
                </span>
                <button
                  onClick={onPlanQuestClick}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <LucideIcon name="Plus" size={10} />
                  Add Mission
                </button>
              </div>

              {missions.length === 0 ? (
                <div className="h-48 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <LucideIcon name="Inbox" size={26} />
                  <span>No active missions for this date.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {missions.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 bg-slate-950 border rounded-xl flex items-center justify-between gap-4 transition-all ${
                        m.completed ? 'border-emerald-500/30 bg-emerald-950/5' : 'border-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onCompleteQuest(m.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            m.completed
                              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20'
                              : 'border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-400'
                          }`}
                        >
                          <LucideIcon name={m.completed ? 'Check' : 'Square'} size={13} />
                        </button>
                        
                        <div>
                          <span
                            onClick={() => onEditQuest(m)}
                            className={`text-xs font-bold text-slate-200 block cursor-pointer hover:underline ${
                              m.completed ? 'line-through opacity-50' : ''
                            }`}
                          >
                            {m.name}
                          </span>
                          <div className="flex gap-1.5 items-center mt-1 text-[8px] text-slate-500">
                            <span className="px-1 py-0.5 rounded bg-slate-900 border border-slate-850 uppercase font-black">
                              {categories.find((c) => c.id === m.categoryId)?.name || m.categoryId}
                            </span>
                            <span className="px-1 py-0.5 rounded bg-slate-900 border border-slate-850 uppercase">
                              {m.priority || 'Medium'}
                            </span>
                            {m.startTime && (
                              <span className="text-slate-400 font-bold font-mono">
                                @ {m.startTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEditQuest(m)}
                          className="p-1 hover:bg-slate-900 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <LucideIcon name="Edit" size={11} />
                        </button>
                        <button
                          onClick={() => onDeleteQuest(m.id)}
                          className="p-1 hover:bg-slate-900 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <LucideIcon name="Trash2" size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMELINE HOUR SEGMENTS */}
          {activeTab === 'timeline' && (
            <Timeline missions={missions} onEditMission={onEditQuest} />
          )}

          {/* TAB 3: NOTES EDITOR */}
          {activeTab === 'notes' && (
            <NotesEditor
              dateStr={dateStr}
              initialNote={note}
              onSave={(noteData) => onSaveNote(dateStr, noteData)}
            />
          )}

          {/* TAB 4: JOURNAL REFLECTION */}
          {activeTab === 'journal' && (
            <JournalEditor
              dateStr={dateStr}
              initialJournal={journal}
              onSave={(journalData) => onSaveJournal(dateStr, journalData)}
            />
          )}

        </div>
      </motion.div>
    </div>
  );
};
export default DayPanel;
