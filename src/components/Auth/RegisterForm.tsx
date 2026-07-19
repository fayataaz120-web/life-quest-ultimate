/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';
import { getPasswordStrength } from '../../services/auth';

interface RegisterFormProps {
  onSubmit: (name: string, email: string, pass: string, confirmPass: string, termsAccepted: boolean) => void;
  onNavigateToLogin: () => void;
  isSubmitting: boolean;
  error: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onNavigateToLogin,
  isSubmitting,
  error,
}) => {
  const [registerName, setRegisterName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(registerName, email, password, confirmPassword, termsAccepted);
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/25 rounded-2xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <LucideIcon name="Compass" size={24} />
        </div>
        <h2 className="text-xl font-black text-white tracking-widest uppercase">Join the Guild</h2>
        <p className="text-xs text-slate-400">Establish a new productivity ledger profile</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-400 text-center font-mono font-medium animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Moniker / Player Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">PLAYER NAME</label>
          <div className="relative flex items-center">
            <LucideIcon name="User" size={14} className="absolute left-3 text-slate-500" />
            <input
              type="text"
              required
              placeholder="e.g. Arthur Pendragon"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all font-medium placeholder-slate-600"
            />
          </div>
        </div>

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
          <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">PASSWORD</label>
          <div className="relative flex items-center">
            <LucideIcon name="Lock" size={14} className="absolute left-3 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Create secure cipher code"
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

          {/* Password strength score metrics */}
          {password && (
            <div className="flex items-center justify-between pt-1 font-mono text-[9px]">
              <span className="text-slate-500">CIPHER SECURITY:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }}></div>
                </div>
                <span className={strength.text}>{strength.label.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">CONFIRM PASSWORD</label>
          <div className="relative flex items-center">
            <LucideIcon name="Lock" size={14} className="absolute left-3 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Repeat cipher code"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all font-mono placeholder-slate-600"
            />
          </div>
        </div>

        {/* Covenant / terms agreement */}
        <div className="flex items-center gap-2 text-xs pt-1.5">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="rounded border-slate-800 bg-slate-900 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
            />
            <span>I accept the covenant & terms</span>
          </label>
        </div>

        {/* Submit action button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-amber-550 to-amber-650 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Begin Your Journey</span>
              <LucideIcon name="Compass" size={14} />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-900/60">
        <span>Already registered? </span>
        <button
          onClick={() => {
            sfx.playSkillUnlock();
            onNavigateToLogin();
          }}
          className="text-blue-450 hover:underline font-bold cursor-pointer"
        >
          Recall Existing Ledger
        </button>
      </div>
    </div>
  );
};
