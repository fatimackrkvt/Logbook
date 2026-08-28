import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { loadTodos, saveTodos } from './storage';
import { loadPhoneUsage, savePhoneUsage } from './phoneUsageStorage';
import { loadTrackers, saveTrackers } from './trackerStorage';
import { loadTrips, saveTrips } from './tripStorage';

// Exports every feature's data into one JSON file, then opens the native
// share sheet so the person can save it to Drive, email it, etc.
export async function exportBackup() {
  const [todos, phoneUsage, trackers, trips] = await Promise.all([
    loadTodos(),
    loadPhoneUsage(),
    loadTrackers(),
    loadTrips(),
  ]);

  const payload = {
    app: 'logbook',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { todos, phoneUsage, trackers, trips },
  };

  const filename = `logbook-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save Logbook backup' });
  }
  return fileUri;
}

// Reads a previously-exported backup file and overwrites all current local
// data with its contents. Caller is responsible for confirming with the user
// first, since this is destructive.
export async function importBackup(fileUri) {
  const raw = await FileSystem.readAsStringAsync(fileUri);
  const parsed = JSON.parse(raw);

  if (!parsed || parsed.app !== 'logbook' || !parsed.data) {
    throw new Error("This file doesn't look like a Logbook backup.");
  }

  const { todos, phoneUsage, trackers, trips } = parsed.data;
  await Promise.all([
    todos !== undefined ? saveTodos(todos) : null,
    phoneUsage !== undefined ? savePhoneUsage(phoneUsage) : null,
    trackers !== undefined ? saveTrackers(trackers) : null,
    trips !== undefined ? saveTrips(trips) : null,
  ]);
}
