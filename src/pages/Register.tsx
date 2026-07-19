/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from '../components/LucideIcon';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { SetupData } from '../types/auth';
import { sfx } from '../utils/audio';
import { validateEmail } from '../services/auth';
import magicalCircles from '../../assets/magical_circles.png';

interface RegisterProps {
  onRegister: (email: string, pass: string) => void;
  onCompleteSetup: (data: SetupData) => void;
  onNavigateToLogin: () => void;
  usersRegistry: { [email: string]: string };
}

export const Register: React.FC<RegisterProps> = ({
  onRegister,
  onCompleteSetup,
  onNavigateToLogin,
  usersRegistry,
}) => {
  const [mode, setMode] = useState<'register' | 'setup'>(() => {
    const activeUser = localStorage.getItem('life_quest_active_session_email');
    return activeUser ? 'setup' : 'register';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup Wizard State
  const [setupStep, setSetupStep] = useState(1);
  const [playerName, setPlayerName] = useState('');
  const [journeyName, setJourneyName] = useState('Chapter 1: The Awakening');
  const [theme, setTheme] = useState('Alchemist Sanctuary');
  const [timeZone, setTimeZone] = useState('UTC+05:30 (India Standard Time)');
  const [dailyResetTime, setDailyResetTime] = useState('05:00 AM');
  const [mainGoal, setMainGoal] = useState('');

  const handleRegisterSubmit = (
    nameVal: string,
    emailVal: string,
    passVal: string,
    confirmPassVal: string,
    termsAcceptedVal: boolean
  ) => {
    setError('');

    if (!nameVal.trim() || !emailVal.trim() || !passVal || !confirmPassVal) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (!validateEmail(emailVal)) {
      setError('Invalid email format.');
      return;
    }

    if (passVal.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (passVal !== confirmPassVal) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAcceptedVal) {
      setError('You must accept the terms of the quest guild.');
      return;
    }

    if (usersRegistry[emailVal.toLowerCase()]) {
      setError('This email is already registered.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onRegister(emailVal.toLowerCase(), passVal);
      setEmail(emailVal.toLowerCase());
      setPassword(passVal);
      setPlayerName(nameVal.trim());
      sfx.playLevelUp();
      setMode('setup');
      setSetupStep(1);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleSetupComplete = () => {
    if (!playerName.trim()) {
      alert('Player name cannot be empty.');
      return;
    }
    if (!mainGoal.trim()) {
      alert('You must define your main Life Goal to activate the matrix.');
      return;
    }

    sfx.playLevelUp();
    onCompleteSetup({
      playerName: playerName.trim(),
      journeyName: journeyName.trim() || 'Chapter 1: The Awakening',
      theme,
      timeZone,
      dailyResetTime,
      mainGoal: mainGoal.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      
      {/* MAGICAL SPELL CIRCLE BACKGROUND EFFECT */}
      <div className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px] pointer-events-none opacity-[0.08] select-none flex items-center justify-center z-0">
        <img 
          src={magicalCircles} 
          alt="Magical Circles Background" 
          className="w-full h-full object-contain animate-[spin_120s_linear_infinite]"
        />
      </div>

      {/* AMBIENT GLOW EFFECTS */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* CORE GLASS CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-md bg-slate-950/60 border border-slate-900/60 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
        <AnimatePresence mode="wait">
          {mode === 'register' ? (
            <motion.div
              key="register-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <RegisterForm
                onSubmit={handleRegisterSubmit}
                onNavigateToLogin={onNavigateToLogin}
                isSubmitting={isSubmitting}
                error={error}
              />
            </motion.div>
          ) : (
            <motion.div
              key="setup-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Wizard Steps indicator */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-900/80">
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-widest uppercase">Sanctuary Matrix Setup</span>
                  <h3 className="text-md font-black text-white">First-Time Setup Wizard</h3>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2.5 py-0.5 rounded-full shrink-0">
                  STEP {setupStep} / 6
                </div>
              </div>

              {/* Wizard Screen content */}
              <div className="min-h-[160px] flex flex-col justify-center">
                {/* Step 1: Choose Player Name */}
                {setupStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Inscribe Player Identity</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Choose your hero's moniker. This name represents your avatar in the guild registers.</p>
                    </div>
                    <div className="relative flex items-center">
                      <LucideIcon name="User" size={14} className="absolute left-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Choose Moniker Name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-emerald-500 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Choose Journey Name */}
                {setupStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Chapter Designation</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Inscribe the title of your first epoch/chapter. You can name it based on your seasonal target.</p>
                    </div>
                    <div className="relative flex items-center">
                      <LucideIcon name="Compass" size={14} className="absolute left-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chapter 1: The Awakening"
                        value={journeyName}
                        onChange={(e) => setJourneyName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-emerald-500 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Select Theme */}
                {setupStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Select Evolving Headquarters</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Configure the virtual background aesthetic of your guild vault.</p>
                    </div>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    >
                      <option value="Small Study Room">Small Study Room (Level 1)</option>
                      <option value="Alchemist Sanctuary">Alchemist Sanctuary (Level 5)</option>
                      <option value="Celestial Observatory">Celestial Observatory (Level 15)</option>
                      <option value="Ethereal Archive">Ethereal Archive (Level 25)</option>
                    </select>
                  </motion.div>
                )}

                {/* Step 4: Select Time Zone */}
                {setupStep === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Time Zone Configuration</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Align Ultimate Quest temporal checks to match your local timezone.</p>
                    </div>
                    <select
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    >
                      <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                      <option value="UTC+00:00 (Greenwich Mean Time)">UTC+00:00 (GMT)</option>
                      <option value="UTC+01:00 (Central European Time)">UTC+01:00 (CET)</option>
                      <option value="UTC+05:30 (India Standard Time)">UTC+05:30 (IST)</option>
                      <option value="UTC+08:00 (Singapore Standard Time)">UTC+08:00 (SST)</option>
                      <option value="UTC+09:00 (Japan Standard Time)">UTC+09:00 (JST)</option>
                    </select>
                  </motion.div>
                )}

                {/* Step 5: Select Daily Reset Hour */}
                {setupStep === 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Daily Reset Epoch</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Set the hour when daily contracts refresh and streak decay tests occur.</p>
                    </div>
                    <select
                      value={dailyResetTime}
                      onChange={(e) => setDailyResetTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    >
                      <option value="12:00 AM">12:00 AM (Midnight)</option>
                      <option value="04:00 AM">04:00 AM</option>
                      <option value="05:00 AM">05:00 AM (Recommended)</option>
                      <option value="06:00 AM">06:00 AM</option>
                    </select>
                  </motion.div>
                )}

                {/* Step 6: Enter Main Life Goal */}
                {setupStep === 6 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Declare Main Life Goal</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Describe the overarching epic campaign you want to achieve during this journey.</p>
                    </div>
                    <textarea
                      required
                      placeholder="e.g. Master React Native & Publish 2 Apps, Complete 100 Days of Dieting..."
                      value={mainGoal}
                      onChange={(e) => setMainGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Wizard Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-900/60">
                {setupStep > 1 ? (
                  <button
                    onClick={() => {
                      sfx.playSkillUnlock();
                      setSetupStep((prev) => prev - 1);
                    }}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-450 hover:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Go Back
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sfx.playSkillUnlock();
                      setMode('register');
                    }}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-500 hover:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Reset Form
                  </button>
                )}

                {setupStep < 6 ? (
                  <button
                    onClick={() => {
                      sfx.playSkillUnlock();
                      setSetupStep((prev) => prev + 1);
                    }}
                    disabled={setupStep === 1 ? !playerName.trim() : false}
                    className="flex-1 py-2.5 cursor-pointer bg-gradient-to-r from-amber-550 to-amber-650 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next Phase</span>
                    <LucideIcon name="ArrowRight" size={12} />
                  </button>
                ) : (
                  <button
                    onClick={handleSetupComplete}
                    disabled={!mainGoal.trim()}
                    className="flex-1 cursor-pointer bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Inscribe Setup</span>
                    <LucideIcon name="Sparkles" size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
