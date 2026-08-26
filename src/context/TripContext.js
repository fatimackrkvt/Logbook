import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { loadTrips, saveTrips } from '../utils/tripStorage';

const TripContext = createContext(null);

// trip: { id, title, type: 'local'|'domestic'|'abroad', startDate, endDate, cost, currency, note }

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTrips().then((data) => {
      setTrips(data.trips || []);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveTrips({ trips });
  }, [trips, loaded]);

  const addTrip = useCallback((input) => {
    const trip = {
      id: uuidv4(),
      title: input.title.trim(),
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      cost: input.cost || 0,
      currency: input.currency || '',
      note: input.note || '',
    };
    setTrips((prev) => [...prev, trip]);
  }, []);

  const updateTrip = useCallback((id, patch) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTrip = useCallback((id) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TripContext.Provider value={{ trips, loaded, addTrip, updateTrip, deleteTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used within TripProvider');
  return ctx;
}
