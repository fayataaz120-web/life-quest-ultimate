/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from '../components/LucideIcon';
import { LoginForm } from '../components/Auth/LoginForm';
import { sfx } from '../utils/audio';
import magicalCircles from '../../assets/magical_circles.png';

interface LoginProps {
  onLogin: (email: string) => void;
  onNavigateToRegister: () => void;
  usersRegistry: { [email: string]: string };
}

export const Login: React.FC<LoginProps> = ({
  onLogin,
  onNavigateToRegister,
  usersRegistry,
}) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (emailVal: string, passwordVal: string) => {
    setError('');
    setIsSubmitting(true);
    
    setTimeout(() => {
      const storedPassword = usersRegistry[emailVal.toLowerCase()];
      if (storedPassword && storedPassword === passwordVal) {
        sfx.playLevelUp();
        onLogin(emailVal.toLowerCase());
      } else {
        setError('Invalid email or password. Verify credentials or create an account.');
        sfx.toggle(true);
        // Custom chimes play on failure as well as alerts
        alert('Authentication failed: Invalid credentials.');
      }
      setIsSubmitting(false);
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setSuccessMsg('Reset instructions siphoned to your mailbox.');
      setIsSubmitting(false);
    }, 1000);
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
          {mode === 'login' ? (
            <motion.div
              key="login-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <LoginForm
                onSubmit={handleLoginSubmit}
                onNavigateToRegister={onNavigateToRegister}
                onNavigateToForgot={() => setMode('forgot')}
                isSubmitting={isSubmitting}
                error={error}
              />
            </motion.div>
          ) : (
            <motion.div
              key="forgot-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-indigo-400">
                  <LucideIcon name="History" size={24} />
                </div>
                <h2 className="text-xl font-black text-white tracking-widest uppercase">Restore Sanctuary</h2>
                <p className="text-xs text-slate-400">Input your registered email to channel a password reset spell</p>
              </div>

              {error && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-400 text-center font-mono">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-xs text-emerald-400 text-center font-mono">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">EMAIL ADDRESS</label>
                  <div className="relative flex items-center">
                    <LucideIcon name="Mail" size={14} className="absolute left-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. seeker@questmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all font-medium placeholder-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-550 to-amber-650 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <LucideIcon name="Send" size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-900/60">
                <button
                  onClick={() => {
                    sfx.playSkillUnlock();
                    setMode('login');
                  }}
                  className="text-slate-450 hover:text-white hover:underline cursor-pointer font-semibold"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
