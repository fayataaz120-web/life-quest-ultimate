/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JourneyHistoryEntry, JourneyStats, AppState } from '../types';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export interface LegacyBadge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export type { JourneyHistoryEntry, JourneyStats, AppState };
