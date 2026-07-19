/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

interface LoginFormProps {
  onSubmit: (email: string, pass: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
  isSubmitting: boolean;
  error: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onNavigateToRegister,
  onNavigateToForgot,
  isSubmitting,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    onSubmit(email.trim().toLowerCase(), password);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <LucideIcon name="Crown" size={24} className="animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-white tracking-widest uppercase">Ultimate Quest</h2>
        <p className="text-xs text-slate-400">Inscribe your credentials to continue your journey</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-400 text-center font-mono font-medium animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
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

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">PASSWORD</label>
            <button
              type="button"
              onClick={() => {
                sfx.playSkillUnlock();
                onNavigateToForgot();
              }}
              className="text-[10px] text-amber-500 font-mono hover:underline cursor-pointer"
            >
              FORGOT?
            </button>
          </div>
          <div className="relative flex items-center">
            <LockIconOrPlaceholder />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter secret cipher"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all font-mono placeholder-slate-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-500 hover:text-white cursor-pointer"
            >
              <LucideIcon name={showPassword ? 'EyeOff' : 'Eye'} size={14} />
            </button>
          </div>
        </div>

        {/* Remember Cipher checkbox */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-800 bg-slate-900 text-emerald-650 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Remember Cipher</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-amber-550 to-amber-650 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Continue Your Journey</span>
              <LucideIcon name="ArrowRight" size={14} />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-900/60">
        <span>New to the guild? </span>
        <button
          onClick={() => {
            sfx.playSkillUnlock();
            onNavigateToRegister();
          }}
          className="text-blue-450 hover:underline font-bold cursor-pointer"
        >
          Inscribe New Account
        </button>
      </div>
    </div>
  );
};

// Extracted internal subcomponent for lock icon to keep LoginForm clean
const LockIconOrPlaceholder: React.FC = () => {
  return <LucideIcon name="Lock" size={14} className="absolute left-3 text-slate-500" />;
};
