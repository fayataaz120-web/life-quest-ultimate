/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestEvent } from './types';

export const CURRENT_SCHEMA_VERSION = 1;

export type MigrationFn = (event: any) => any;

/**
 * A registry of migration functions indexed by the target schema version.
 * When the event schema structure changes, add a migration function here.
 * E.g., a migration to version 2 would be registered as:
 * 2: (event) => {
 *   // transform event
 *   return event;
 * }
 */
const migrationsRegistry: Record<number, MigrationFn> = {
  // Example of a pass-through/identity migration if needed in tests:
  // 2: (event) => {
  //   if (event.eventType === 'TASK_COMPLETED' && !event.payload.hasOwnProperty('isRecurring')) {
  //     event.payload.isRecurring = false;
  //   }
  //   return event;
  // }
};

/**
 * Migrates a single event from its current schema version to the target version.
 * Performs incremental upgrades version by version.
 */
export function migrateEvent(
  event: QuestEvent,
  targetVersion: number = CURRENT_SCHEMA_VERSION
): QuestEvent {
  // Work on a deep copy of the event to keep inputs immutable
  const migrated = JSON.parse(JSON.stringify(event)) as QuestEvent;
  let currentVersion = migrated.schemaVersion ?? 0;

  while (currentVersion < targetVersion) {
    const nextVersion = currentVersion + 1;
    const migrationFn = migrationsRegistry[nextVersion];
    
    if (migrationFn) {
      try {
        const result = migrationFn(migrated);
        // Ensure properties like id, eventType, etc. are preserved
        Object.assign(migrated, result);
      } catch (err) {
        console.error(`Failed to migrate event ${migrated.id} to version ${nextVersion}`, err);
        throw err;
      }
    }
    
    migrated.schemaVersion = nextVersion;
    currentVersion = nextVersion;
  }

  return migrated;
}

/**
 * Migrates an array of events to the current schema version.
 */
export function migrateEvents(events: QuestEvent[]): QuestEvent[] {
  return events.map((event) => migrateEvent(event, CURRENT_SCHEMA_VERSION));
}

/**
 * Register a test migration. Useful for unit tests to verify migration runner.
 */
export function registerTestMigration(targetVersion: number, migrationFn: MigrationFn): void {
  migrationsRegistry[targetVersion] = migrationFn;
}

/**
 * Unregister a migration (for cleanup in tests).
 */
export function unregisterTestMigration(targetVersion: number): void {
  delete migrationsRegistry[targetVersion];
}
