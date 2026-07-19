/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PasswordStrength {
  label: 'Empty' | 'Weak' | 'Medium' | 'Strong';
  score: number;
  color: string;
  text: string;
}

export interface SetupData {
  playerName: string;
  journeyName: string;
  theme: string;
  timeZone: string;
  dailyResetTime: string;
  mainGoal: string;
}
