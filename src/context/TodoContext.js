import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { loadTodos, saveTodos } from '../utils/storage';
import { todayStr } from '../utils/recurrence';

const TodoContext = createContext(null);

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTodos().then((t) => {
      setTodos(t);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveTodos(todos);
  }, [todos, loaded]);

  // input: { title, type, dueDate?, daysOfWeek?, intervalDays?, frequencyCount?, frequencyPeriod?, deadlineTime? }
  const addTodo = useCallback((input) => {
    const newTodo = {
      id: uuidv4(),
      title: input.title.trim(),
      type: input.type, // 'once' | 'daily' | 'weekly' | 'interval' | 'frequency'
      dueDate: input.dueDate || null,
      daysOfWeek: input.daysOfWeek || null,
      intervalDays: input.intervalDays || null,
      frequencyCount: input.frequencyCount || null,
      frequencyPeriod: input.frequencyPeriod || null, // 'week' | 'month'
      deadlineTime: input.deadlineTime || null,
      createdAt: todayStr(),
      completions: {}, // { 'YYYY-MM-DD': 'done' | 'missed' | 'skipped' }
      notes: {},
      durations: {}, // { 'YYYY-MM-DD': minutes } — optional, set manually or via the start/stop timer
      activeTimerStartedAt: null, // ISO timestamp while a timer is running, else null
    };
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // status: 'done' | 'missed' | 'skipped' | null (null clears the entry)
  // durationMinutes: undefined = don't touch; 0 or falsy = clear; >0 = set
  const setCompletion = useCallback((id, dateStr, status, note, durationMinutes) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const completions = { ...t.completions };
        const notes = { ...t.notes };
        const durations = { ...(t.durations || {}) };
        if (status === null) {
          delete completions[dateStr];
          delete notes[dateStr];
          delete durations[dateStr];
        } else {
          completions[dateStr] = status;
          if (note !== undefined) {
            // explicit note passed (even empty string) — set or clear it
            if (note && note.trim()) notes[dateStr] = note;
            else delete notes[dateStr];
          }
          if (durationMinutes !== undefined) {
            if (durationMinutes > 0) durations[dateStr] = durationMinutes;
            else delete durations[dateStr];
          }
          // undefined means "don't touch" (e.g. a plain status tap)
        }
        return { ...t, completions, notes, durations };
      })
    );
  }, []);

  const startTimer = useCallback((id) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, activeTimerStartedAt: new Date().toISOString() } : t)));
  }, []);

  const cancelTimer = useCallback((id) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, activeTimerStartedAt: null } : t)));
  }, []);

  // Stops the running timer, marks the day it was started on as done, and
  // records the elapsed wall-clock time as that day's duration. Using
  // wall-clock time (now - startedAt) rather than a live counter means this
  // is accurate even if the app was backgrounded while the timer ran.
  const stopTimer = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id || !t.activeTimerStartedAt) return t;
        const startedMs = new Date(t.activeTimerStartedAt).getTime();
        const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedMs) / 60000));
        const dateStr = todayStr(new Date(t.activeTimerStartedAt)); // attribute to the day it was started
        const completions = { ...t.completions, [dateStr]: 'done' };
        const durations = { ...(t.durations || {}), [dateStr]: elapsedMinutes };
        return { ...t, completions, durations, activeTimerStartedAt: null };
      })
    );
  }, []);

  return (
    <TodoContext.Provider
      value={{ todos, loaded, addTodo, deleteTodo, setCompletion, startTimer, stopTimer, cancelTimer }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within TodoProvider');
  return ctx;
}
