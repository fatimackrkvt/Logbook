# Todo App (Expo / React Native)

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your Android phone. That's it — no build step needed for daily use.

## What's here (todo-list part only, for now)

- **Types of to-do**: `once`, `daily`, `weekly` (pick specific days), `interval` (every N days), `frequency` (X times per week/month, any days).
- **Completion states**: `done`, `missed`, `skipped` — tap a status circle to set it for today, tap again to clear. Storing three states (not just done/not-done) means a legitimate day off doesn't look the same as failing, and later you can build honest streaks/stats off the log.
- **Frequency-type progress**: shown as `done/target this week` — recomputed live from the completion log, not stored separately.
- **Persistence**: AsyncStorage, fully local, no backend, no login. Good fit for "just for me" phase.

## Structure

```
App.js                        entry point
src/context/TodoContext.js    state + CRUD (addTodo, deleteTodo, setCompletion)
src/utils/recurrence.js       isDueOn(), frequencyProgress() — the scheduling logic
src/utils/storage.js          AsyncStorage read/write
src/components/AddTodoModal.js  the "new todo" form with type picker
src/components/TodoItem.js    a single row: title, subtitle, status buttons
src/screens/HomeScreen.js     today's list + floating add button
```

## Not built yet (next passes)

- A history/calendar view (see past days, streaks, stats)
- Editing an existing todo
- Reminders/notifications
- Phone usage tracking (separate feature, on purpose — kept out of this pass)

## Why these decisions

- **`once` vs recurring types are separate fields, not one flexible "cron string"** — much easier to build a clean form UI around named types than to parse/generate a cron-like expression, and you're the only user so you don't need that flexibility yet.
- **`frequency` is a distinct type from `weekly`** — "3x this week, any days" needs a running count, not a per-day check, so its UI and logic are naturally different from a fixed weekly schedule.
- **No react-navigation yet** — single screen + a modal keeps the dependency surface small while there's only one feature. Worth adding once you have 2+ screens (e.g. a History tab).
