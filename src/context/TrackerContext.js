import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { loadTrackers, saveTrackers } from '../utils/trackerStorage';

const TrackerContext = createContext(null);

// tracker: { id, name, icon, template: 'range'|'event'|'dailyTwoTime', labels: {}, archived, createdAt }
// entry (fields depend on tracker.template):
//   range:        { id, trackerId, title, startDate, endDate, note }
//   event:        { id, trackerId, date, minutes, note }
//   dailyTwoTime: { id, trackerId, date, timeA, timeB, note }

export function TrackerProvider({ children }) {
  const [trackers, setTrackers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTrackers().then((data) => {
      setTrackers(data.trackers || []);
      setEntries(data.entries || []);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveTrackers({ trackers, entries });
  }, [trackers, entries, loaded]);

  const addTracker = useCallback((input) => {
    const tracker = {
      id: uuidv4(),
      name: input.name.trim(),
      icon: input.icon || '📌',
      template: input.template,
      labels: input.labels || {},
      archived: false,
      createdAt: new Date().toISOString(),
    };
    setTrackers((prev) => [...prev, tracker]);
    return tracker;
  }, []);

  const archiveTracker = useCallback((id) => {
    setTrackers((prev) => prev.map((t) => (t.id === id ? { ...t, archived: true } : t)));
  }, []);

  const unarchiveTracker = useCallback((id) => {
    setTrackers((prev) => prev.map((t) => (t.id === id ? { ...t, archived: false } : t)));
  }, []);

  const addEntry = useCallback((trackerId, data) => {
    const entry = { id: uuidv4(), trackerId, ...data };
    setEntries((prev) => [...prev, entry]);
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const entriesForTracker = useCallback((trackerId) => entries.filter((e) => e.trackerId === trackerId), [entries]);

  return (
    <TrackerContext.Provider
      value={{
        trackers,
        entries,
        loaded,
        addTracker,
        archiveTracker,
        unarchiveTracker,
        addEntry,
        deleteEntry,
        entriesForTracker,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTrackers() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTrackers must be used within TrackerProvider');
  return ctx;
}
