/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_COMPANIONS } from '../data/companions';

interface ProfileMenuProps {
  state: AppState;
  email: string;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
  onExportData: () => void;
  onImportData: (imported: AppState) => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  state,
  email,
  onUpdateState,
  onLogout,
  onExportData,
  onImportData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'profile' | 'settings' | 'theme' | 'logout'>('none');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states for settings
  const [editName, setEditName] = useState(state.player.name);
  const [editGoal, setEditGoal] = useState(state.player.mainGoal || '');
  const [editTimeZone, setEditTimeZone] = useState(state.player.timeZone || 'UTC+05:30 (India Standard Time)');
  const [editResetTime, setEditResetTime] = useState(state.player.dailyResetTime || '05:00 AM');

  // Sync edits when state changes
  useEffect(() => {
    setEditName(state.player.name);
    setEditGoal(state.player.mainGoal || '');
    setEditTimeZone(state.player.timeZone || 'UTC+05:30 (India Standard Time)');
    setEditResetTime(state.player.dailyResetTime || '05:00 AM');
  }, [state.player]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleMenu = () => {
    sfx.playSkillUnlock();
    setIsOpen(!isOpen);
  };

  const handleOpenModal = (modal: typeof activeModal) => {
    sfx.playSkillUnlock();
    setActiveModal(modal);
    setIsOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert("Player name cannot be empty.");
      return;
    }
    if (!editGoal.trim()) {
      alert("Main goal cannot be empty.");
      return;
    }

    onUpdateState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        name: editName.trim(),
        mainGoal: editGoal.trim(),
        timeZone: editTimeZone,
        dailyResetTime: editResetTime
      }
    }));
    sfx.playLevelUp();
    setActiveModal('none');
  };

  const handleSelectTheme = (themeName: string) => {
    onUpdateState(prev => ({
      ...prev,
      headquartersTheme: themeName
    }));
    sfx.playLevelUp();
    setActiveModal('none');
  };

  const triggerImportFile = () => {
    sfx.playSkillUnlock();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as AppState;
          if (parsed && parsed.player && parsed.player.name) {
            onImportData(parsed);
            sfx.playLevelUp();
            alert("sanctuary data restored successfully.");
          } else {
            alert("Invalid save file structure.");
          }
        } catch (err) {
          alert("Failed to parse data package.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
    setIsOpen(false);
  };

  const companion = DEFAULT_COMPANIONS.find(c => c.id === state.player.companionId) || DEFAULT_COMPANIONS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* TRIGGER AVATAR ACTION BUTTON */}
      <button
        onClick={handleToggleMenu}
        className="flex items-center gap-2.5 p-1 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer select-none"
      >
        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
          <LucideIcon name="User" size={15} className="text-emerald-400" />
        </div>
        <div className="hidden sm:block text-left pr-2 max-w-[100px] truncate">
          <div className="text-[10px] font-black text-white leading-none truncate">{state.player.name}</div>
          <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest leading-none">
            {state.player.rank || 'Initiate'}
          </span>
        </div>
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2.5 w-56 bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-md"
          >
            {/* Header info */}
            <div className="p-3 border-b border-slate-900/60 text-xs">
              <div className="font-black text-slate-100 truncate">{state.player.name}</div>
              <div className="text-[9px] font-mono text-slate-500 truncate">{email}</div>
            </div>

            <div className="py-1.5 space-y-0.5">
              <button
                onClick={() => handleOpenModal('profile')}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900/40 flex items-center gap-3 transition-colors cursor-pointer text-left font-semibold"
              >
                <LucideIcon name="Shield" size={14} className="text-blue-400" />
                <span>Player Profile</span>
              </button>

              <button
                onClick={() => handleOpenModal('settings')}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900/40 flex items-center gap-3 transition-colors cursor-pointer text-left font-semibold"
              >
                <LucideIcon name="Settings" size={14} className="text-amber-400" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => handleOpenModal('theme')}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900/40 flex items-center gap-3 transition-colors cursor-pointer text-left font-semibold"
              >
                <LucideIcon name="Sparkles" size={14} className="text-violet-400" />
                <span>HQ Theme</span>
              </button>

              <button
                onClick={onExportData}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900/40 flex items-center gap-3 transition-colors cursor-pointer text-left font-semibold"
              >
                <LucideIcon name="Download" size={14} className="text-emerald-400" />
                <span>Export Ledger Data</span>
              </button>

              <button
                onClick={triggerImportFile}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900/40 flex items-center gap-3 transition-colors cursor-pointer text-left font-semibold"
              >
                <LucideIcon name="Upload" size={14} className="text-sky-400" />
                <span>Import Ledger Data</span>
              </button>

              <div className="border-t border-slate-900/60 my-1"></div>

              <button
                onClick={() => handleOpenModal('logout')}
                className="w-full px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 flex items-center gap-3 transition-colors cursor-pointer text-left font-bold"
              >
                <LucideIcon name="LogOut" size={14} />
                <span>Leave Journey</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- MODALS PANEL ---------------- */}
      <AnimatePresence>
        
        {/* 1. PLAYER PROFILE MODAL */}
        {activeModal === 'profile' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={20} />
              </button>

              <div className="text-center space-y-3 pb-4 border-b border-slate-900/65">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <LucideIcon name="Crown" size={32} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{state.player.name}</h3>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase">
                    Level {state.player.level} • {state.player.rank || 'Bronze I'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/80">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase font-mono">COINS BALANCE</span>
                    <span className="text-sm font-black text-yellow-400">{state.player.coins} Gold</span>
                  </div>
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/80">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase font-mono">ACTIVE STREAK</span>
                    <span className="text-sm font-black text-red-400">{state.player.currentStreak} Days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>EMAIL LINK:</span>
                    <span className="text-slate-200">{email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>TIME ZONE:</span>
                    <span className="text-slate-200">{state.player.timeZone || 'UTC+05:30 (IST)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>DAILY RESET:</span>
                    <span className="text-slate-200">{state.player.dailyResetTime || '05:00 AM'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/25 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-550 block font-bold">MAIN COVENANT LIFE GOAL:</span>
                  <p className="text-[11px] text-slate-300 italic font-semibold">"{state.player.mainGoal || 'No goal designated.'}"</p>
                </div>
              </div>

              <button
                onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                className="w-full py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </motion.div>
          </div>
        )}

        {/* 2. ACCOUNT SETTINGS MODAL */}
        {activeModal === 'settings' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={20} />
              </button>

              <div>
                <h3 className="text-base font-black text-white">Account Configurations</h3>
                <p className="text-[10px] text-slate-500">Tweak your player parameters and guild reset hours.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">PLAYER NAME</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">TIME ZONE</label>
                  <select
                    value={editTimeZone}
                    onChange={(e) => setEditTimeZone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                    <option value="UTC+00:00 (Greenwich Mean Time)">UTC+00:00 (GMT)</option>
                    <option value="UTC+01:00 (Central European Time)">UTC+01:00 (CET)</option>
                    <option value="UTC+05:30 (India Standard Time)">UTC+05:30 (IST)</option>
                    <option value="UTC+08:00 (Singapore Standard Time)">UTC+08:00 (SST)</option>
                    <option value="UTC+09:00 (Japan Standard Time)">UTC+09:00 (JST)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">DAILY RESET HOUR</label>
                  <select
                    value={editResetTime}
                    onChange={(e) => setEditResetTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="12:00 AM">12:00 AM (Midnight)</option>
                    <option value="04:00 AM">04:00 AM</option>
                    <option value="05:00 AM">05:00 AM</option>
                    <option value="06:00 AM">06:00 AM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">MAIN COVENANT LIFE GOAL</label>
                  <textarea
                    required
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 cursor-pointer bg-gradient-to-r from-amber-550 to-amber-650 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all uppercase tracking-wider"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 3. HEADQUARTERS THEME SELECTOR */}
        {activeModal === 'theme' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={20} />
              </button>

              <div>
                <h3 className="text-base font-black text-white">Sanctuary Vault Theme</h3>
                <p className="text-[10px] text-slate-500">Pick the headquarters theme aligned to your rank.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {[
                  { name: 'Small Study Room', desc: 'A modest quarters for beginner Seekers.', level: 1, icon: 'BookOpen' },
                  { name: 'Alchemist Sanctuary', desc: 'Glowing vials and celestial star charts.', level: 5, icon: 'FlaskConical' },
                  { name: 'Celestial Observatory', desc: 'A grand telescope tracking the cosmos.', level: 15, icon: 'Compass' },
                  { name: 'Ethereal Archive', desc: 'Floating parchment library under golden light.', level: 25, icon: 'Library' }
                ].map(t => {
                  const isUnlocked = state.player.level >= t.level;
                  const isSelected = state.headquartersTheme === t.name;

                  return (
                    <button
                      key={t.name}
                      disabled={!isUnlocked}
                      onClick={() => handleSelectTheme(t.name)}
                      className={`p-3.5 border rounded-2xl text-left transition-all flex items-center gap-4 cursor-pointer w-full ${
                        isSelected 
                          ? 'border-emerald-500/50 bg-emerald-950/10' 
                          : isUnlocked 
                          ? 'border-slate-850 bg-slate-900/40 hover:border-slate-700' 
                          : 'border-slate-900 bg-slate-950/20 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${isSelected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 text-slate-500 border-slate-900'}`}>
                        <LucideIcon name={t.icon as any} size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white leading-none">{t.name}</span>
                          {!isUnlocked && (
                            <span className="text-[8px] font-mono font-bold text-red-400 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded">
                              LVL {t.level} REQUIRED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                className="w-full py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Theme Selector
              </button>
            </motion.div>
          </div>
        )}

        {/* 4. LOGOUT CONFIRMATION MODAL */}
        {activeModal === 'logout' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={20} />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <LucideIcon name="LogOut" size={24} className="animate-pulse" />
                  <h4 className="text-base font-black text-white font-sans uppercase tracking-wider">Leave Journey</h4>
                </div>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Are you sure you want to leave your journey?
                </p>
                <p className="text-xs text-slate-550 leading-normal">
                  Your active progress is securely archived in the local vault, and will be restored immediately when you log back in.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { sfx.playSkillUnlock(); setActiveModal('none'); }}
                    className="flex-1 cursor-pointer bg-slate-900 border border-slate-800 text-slate-400 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      sfx.playLevelUp();
                      onLogout();
                      setActiveModal('none');
                    }}
                    className="flex-1 cursor-pointer bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
};
