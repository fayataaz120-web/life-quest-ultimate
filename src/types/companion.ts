/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { Companion } from '../types';

export interface HQTheme {
  name: string;
  minLevel: number;
  description: string;
  icon: string;
  colorClass: string;
  weatherOptions: string[];
}

export interface ChatHistoryEntry {
  sender: 'user' | 'companion';
  text: string;
}

export type { Companion };
