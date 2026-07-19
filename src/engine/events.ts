/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestEvent, QuestEventType } from './types';

/**
 * Generate a unique ID for events.
 */
export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Robust fallback if crypto is not available
  return 'evt_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
}

/**
 * Construct an immutable QuestEvent.
 */
export function createQuestEvent(
  eventType: QuestEventType,
  payload: any,
  timestamp?: number
): QuestEvent {
  return {
    id: generateEventId(),
    timestamp: timestamp ?? Date.now(),
    eventType,
    payload: JSON.parse(JSON.stringify(payload)), // Deep copy to ensure immutability
    schemaVersion: 1, // Current schema version
  };
}

/**
 * Basic validation of a QuestEvent structure.
 */
export function validateQuestEvent(event: any): boolean {
  if (!event || typeof event !== 'object') return false;
  if (typeof event.id !== 'string' || event.id.trim() === '') return false;
  if (typeof event.timestamp !== 'number' || event.timestamp <= 0) return false;
  if (typeof event.eventType !== 'string') return false;
  if (!event.payload || typeof event.payload !== 'object') return false;
  if (typeof event.schemaVersion !== 'number') return false;
  return true;
}
