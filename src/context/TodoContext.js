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
    };
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // status: 'done' | 'missed' | 'skipped' | null (null clears the entry)
  const setCompletion = useCallback((id, dateStr, status, note) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const completions = { ...t.completions };
        const notes = { ...t.notes };
        if (status === null) {
          delete completions[dateStr];
          delete notes[dateStr];
        } else {
          completions[dateStr] = status;
          if (note !== undefined) {
            // explicit note passed (even empty string) — set or clear it
            if (note && note.trim()) notes[dateStr] = note;
            else delete notes[dateStr];
          }
          // note === undefined means "don't touch the note" (e.g. a plain status tap)
        }
        return { ...t, completions, notes };
      })
    );
  }, []);

  return (
    <TodoContext.Provider value={{ todos, loaded, addTodo, deleteTodo, setCompletion }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within TodoProvider');
  return ctx;
}
