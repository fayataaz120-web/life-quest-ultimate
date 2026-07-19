/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState } from '../../types';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

interface JourneyRebirthWizardProps {
  journeyNumber: number;
  totalCompletedQuests: number;
  state: AppState;
  onClose: () => void;
  onStartFreshJourney: (name: string) => void;
  onExecuteRebirth: () => void;
}

export const JourneyRebirthWizard: React.FC<JourneyRebirthWizardProps> = ({
  journeyNumber,
  totalCompletedQuests,
  state,
  onClose,
  onStartFreshJourney,
  onExecuteRebirth,
}) => {
  const [selectedOption, setSelectedOption] = useState<'Fresh' | 'Rebirth' | null>(null);
  const [newJourneyName, setNewJourneyName] = useState(`Chapter ${journeyNumber + 1}: The Legend Continues`);
  
  // Rebirth confirmations
  const [rebirthStep, setRebirthStep] = useState(0); // 0 = none, 1 = warning 1, 2 = warning 2, 3 = type verification
  const [rebirthCodeInput, setRebirthCodeInput] = useState('');

  const startRebirthConfirmFlow = () => {
    sfx.playSkillUnlock();
    setSelectedOption('Rebirth');
    setRebirthStep(1);
  };

  const handleRebirthNext = () => {
    sfx.playCoin();
    setRebirthStep((prev) => prev + 1);
  };

  const handleFreshSubmit = () => {
    if (!newJourneyName.trim()) return;
    onStartFreshJourney(newJourneyName.trim());
  };

  const handleRebirthExecuteSubmit = () => {
    if (rebirthCodeInput.trim().toUpperCase() !== 'REBIRTH') {
      alert('Verification code incorrect. Rites of rebirth aborted.');
      return;
    }
    onExecuteRebirth();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={() => {
            sfx.playSkillUnlock();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
        >
          <LucideIcon name="X" size={20} />
        </button>

        {/* Option Selection */}
        {selectedOption === null && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-blue-400 font-mono uppercase tracking-wider">
                NEW CHAPTER AWAKENING
              </span>
              <h3 className="text-xl font-black text-white mt-1">Embark on a New Journey</h3>
              <p className="text-xs text-slate-400">
                Choose the path of your rebirth. Will you retain your ancestry, or wipe the realm entirely?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option A: Fresh Journey */}
              <button
                onClick={() => {
                  sfx.playSkillUnlock();
                  setSelectedOption('Fresh');
                }}
                className="p-4 border border-slate-800 hover:border-blue-500/50 bg-slate-900/40 hover:bg-blue-950/10 rounded-2xl text-left transition-all space-y-2 group cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/15 text-blue-400 rounded-lg">
                      <LucideIcon name="Crown" size={16} />
                    </div>
                    <span className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                      OPTION A: Fresh Journey
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 font-mono bg-blue-950/40 px-2 py-0.5 rounded-full uppercase">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Archive your current progress into history and start a brand-new level 1 chapter. Your{' '}
                  <strong className="text-slate-350">Lifetime Legacy XP, Achievements, Badges, and History</strong>{' '}
                  remain fully intact.
                </p>
              </button>

              {/* Option B: Rebirth */}
              <button
                onClick={startRebirthConfirmFlow}
                className="p-4 border border-slate-800 hover:border-red-500/50 bg-slate-900/40 hover:bg-red-950/10 rounded-2xl text-left transition-all space-y-2 group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/15 text-red-400 rounded-lg">
                    <LucideIcon name="Skull" size={16} />
                  </div>
                  <span className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                    OPTION B: Complete Rebirth
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Reset <strong className="text-red-400 font-semibold">EVERYTHING</strong>. Erase all history, all
                  achievements, all profiles, and all stats. The application becomes identical to a brand-new
                  installation.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Option A Configuration */}
        {selectedOption === 'Fresh' && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-blue-400 font-mono uppercase tracking-wider">
                CONFIGURING FRESH CHAPTER
              </span>
              <h3 className="text-xl font-black text-white mt-1">Prepare Your Next Chapter</h3>
              <p className="text-xs text-slate-400">Name this next epoch of your productivity campaign.</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Chapter Name
              </label>
              <input
                type="text"
                value={newJourneyName}
                onChange={(e) => setNewJourneyName(e.target.value)}
                placeholder="e.g. Chapter 2: The Return of Focus"
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 transition-all font-bold"
              />
            </div>

            <div className="bg-blue-950/20 border border-blue-500/15 p-4 rounded-xl text-[11px] text-blue-300 leading-relaxed font-sans">
              <strong>Chronicle Split Safeguard:</strong> Confirming will freeze your current Level{' '}
              {state.player.level} character, archive your current {totalCompletedQuests} completed quests, and start
              this fresh epoch instantly!
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sfx.playSkillUnlock();
                  setSelectedOption(null);
                }}
                className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-450 hover:text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleFreshSubmit}
                className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                <LucideIcon name="Check" size={14} />
                Begin New Journey
              </button>
            </div>
          </div>
        )}

        {/* Option B: Rebirth Confirmation Flow */}
        {selectedOption === 'Rebirth' && (
          <div className="space-y-6">
            {rebirthStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-red-500">
                  <LucideIcon name="TriangleAlert" size={24} className="animate-bounce" />
                  <h4 className="text-base font-black text-white">REBIRTH CONFIRMATION [1/3]</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  You have requested a <strong className="text-red-400">Complete Rebirth</strong>. This is extremely
                  destructive and will delete your entire profile, achievements, badges, log records, and all
                  historical chronicles.
                </p>
                <p className="text-xs text-red-400/80 font-bold font-sans">
                  Are you absolutely sure you want to proceed to the next confirmation level?
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      sfx.playSkillUnlock();
                      setSelectedOption(null);
                    }}
                    className="flex-1 cursor-pointer bg-slate-900 border border-slate-800 text-slate-450 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    Nevermind, Cancel
                  </button>
                  <button
                    onClick={handleRebirthNext}
                    className="flex-1 cursor-pointer bg-red-950/40 border border-red-500/30 text-red-405 hover:bg-red-950/60 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Yes, I Understand
                  </button>
                </div>
              </div>
            )}

            {rebirthStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-red-505 animate-pulse">
                  <LucideIcon name="ShieldAlert" size={24} />
                  <h4 className="text-base font-black text-white">REBIRTH WARNING [2/3]</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  This action <strong className="text-red-400">CANNOT BE UNDONE</strong>. Once executed, our servers
                  and your local storage will be scrubbed. You will start as an unnamed level 1 Initiate with zero
                  achievements.
                </p>
                <p className="text-xs text-red-405/80 font-bold uppercase tracking-wider font-mono">
                  There are NO backups. There are NO undos.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      sfx.playSkillUnlock();
                      setSelectedOption(null);
                    }}
                    className="flex-1 cursor-pointer bg-slate-900 border border-slate-800 text-slate-400 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    ABORT ACTION
                  </button>
                  <button
                    onClick={handleRebirthNext}
                    className="flex-1 cursor-pointer bg-red-650 hover:bg-red-500 text-white py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    PROCEED REGARDLESS
                  </button>
                </div>
              </div>
            )}

            {rebirthStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-red-500">
                  <LucideIcon name="Skull" size={24} className="animate-spin" />
                  <h4 className="text-base font-black text-white">FINAL CONFIRMATION [3/3]</h4>
                </div>
                <p className="text-xs text-slate-450 leading-relaxed font-sans">
                  To complete the Rebirth, you must type the word{' '}
                  <strong className="text-red-500 font-mono font-black">REBIRTH</strong> in the input field below to
                  unlock the nuclear incinerator.
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={rebirthCodeInput}
                    onChange={(e) => setRebirthCodeInput(e.target.value)}
                    placeholder="Type REBIRTH here"
                    className="w-full bg-slate-900 border border-red-950 text-red-400 placeholder-red-950 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-red-500 transition-all font-mono font-black uppercase text-center tracking-widest"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      sfx.playSkillUnlock();
                      setSelectedOption(null);
                    }}
                    className="flex-1 cursor-pointer bg-slate-900 border border-slate-800 text-slate-400 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    ABORT REBIRTH
                  </button>
                  <button
                    onClick={handleRebirthExecuteSubmit}
                    disabled={rebirthCodeInput.trim().toUpperCase() !== 'REBIRTH'}
                    className="flex-1 cursor-pointer bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider disabled:opacity-40"
                  >
                    Execute Rebirth
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default JourneyRebirthWizard;
