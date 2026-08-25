import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { loadPhoneUsage, savePhoneUsage } from '../utils/phoneUsageStorage';

const PhoneUsageContext = createContext(null);

export function PhoneUsageProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPhoneUsage().then((data) => {
      setCategories(data.categories || []);
      setEntries(data.entries || []);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) savePhoneUsage({ categories, entries });
  }, [categories, entries, loaded]);

  // Returns the category (existing or newly created) matching this name,
  // case-insensitively, un-archiving it if it had been archived.
  const getOrCreateCategory = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let match = null;
    setCategories((prev) => {
      const existing = prev.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (existing) {
        match = existing;
        if (existing.archived) {
          return prev.map((c) => (c.id === existing.id ? { ...c, archived: false } : c));
        }
        return prev;
      }
      const newCat = { id: uuidv4(), name: trimmed, archived: false };
      match = newCat;
      return [...prev, newCat];
    });
    return match;
  }, []);

  const archiveCategory = useCallback((id) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, archived: true } : c)));
  }, []);

  const unarchiveCategory = useCallback((id) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, archived: false } : c)));
  }, []);

  // input: { date, categoryId, minutes, note }
  const addEntry = useCallback((input) => {
    const entry = {
      id: uuidv4(),
      date: input.date,
      categoryId: input.categoryId,
      minutes: input.minutes,
      note: input.note || '',
    };
    setEntries((prev) => [...prev, entry]);
  }, []);

  const updateEntry = useCallback((id, patch) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <PhoneUsageContext.Provider
      value={{
        categories,
        entries,
        loaded,
        getOrCreateCategory,
        archiveCategory,
        unarchiveCategory,
        addEntry,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </PhoneUsageContext.Provider>
  );
}

export function usePhoneUsage() {
  const ctx = useContext(PhoneUsageContext);
  if (!ctx) throw new Error('usePhoneUsage must be used within PhoneUsageProvider');
  return ctx;
}
