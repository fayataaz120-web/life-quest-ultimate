/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PasswordStrength } from '../types/auth';

/**
 * Calculates the security strength score of a password string.
 */
export const getPasswordStrength = (pwd: string): PasswordStrength => {
  if (!pwd) {
    return {
      label: 'Empty',
      score: 0,
      color: 'bg-slate-800',
      text: 'text-slate-500',
    };
  }
  
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) {
    return {
      label: 'Weak',
      score,
      color: 'bg-red-500',
      text: 'text-red-400',
    };
  }
  if (score <= 3) {
    return {
      label: 'Medium',
      score,
      color: 'bg-amber-500',
      text: 'text-amber-400',
    };
  }
  return {
    label: 'Strong',
    score,
    color: 'bg-emerald-500',
    text: 'text-emerald-400',
  };
};

/**
 * Validates whether an email format is correct.
 */
export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};
