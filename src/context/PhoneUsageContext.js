import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { loadPhoneUsage, savePhoneUsage } from '../utils/phoneUsageStorage';

const PhoneUsageContext = createContext(null);

// category shape: { id, name, archived, subcategories: [{id, name, archived}] }
// entry shape: {
//   id,
//   mode: 'daily' | 'weekly',
//   date: 'YYYY-MM-DD' (set when mode === 'daily'),
//   weekStart: 'YYYY-MM-DD' (Monday, set when mode === 'weekly'),
//   categoryId,
//   breakdown: [{ subcategoryId, minutes }] | null,  // null = plain total, no breakdown
//   minutes: total minutes (always present — either typed directly, or the sum of breakdown)
//   note,
// }

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
      const newCat = { id: uuidv4(), name: trimmed, archived: false, subcategories: [] };
      match = newCat;
      return [...prev, newCat];
    });
    return match;
  }, []);

  const getOrCreateSubcategory = useCallback((categoryId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let match = null;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== categoryId) return c;
        const subs = c.subcategories || [];
        const existing = subs.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) {
          match = existing;
          if (existing.archived) {
            return { ...c, subcategories: subs.map((s) => (s.id === existing.id ? { ...s, archived: false } : s)) };
          }
          return c;
        }
        const newSub = { id: uuidv4(), name: trimmed, archived: false };
        match = newSub;
        return { ...c, subcategories: [...subs, newSub] };
      })
    );
    return match;
  }, []);

  const archiveCategory = useCallback((id) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, archived: true } : c)));
  }, []);

  const unarchiveCategory = useCallback((id) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, archived: false } : c)));
  }, []);

  const archiveSubcategory = useCallback((categoryId, subId) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, subcategories: (c.subcategories || []).map((s) => (s.id === subId ? { ...s, archived: true } : s)) }
      )
    );
  }, []);

  const unarchiveSubcategory = useCallback((categoryId, subId) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, subcategories: (c.subcategories || []).map((s) => (s.id === subId ? { ...s, archived: false } : s)) }
      )
    );
  }, []);

  // input: { mode, date?, weekStart?, categoryId, breakdown?, minutes, note }
  const addEntry = useCallback((input) => {
    const entry = {
      id: uuidv4(),
      mode: input.mode,
      date: input.mode === 'daily' ? input.date : null,
      weekStart: input.mode === 'weekly' ? input.weekStart : null,
      categoryId: input.categoryId,
      breakdown: input.breakdown && input.breakdown.length > 0 ? input.breakdown : null,
      minutes: input.minutes,
      note: input.note || '',
    };
    setEntries((prev) => [...prev, entry]);
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
        getOrCreateSubcategory,
        archiveCategory,
        unarchiveCategory,
        archiveSubcategory,
        unarchiveSubcategory,
        addEntry,
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
