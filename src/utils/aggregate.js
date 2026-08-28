import { isDueOn, TYPE_LABELS } from './recurrence';

// All log entries (across every todo) for a single date, plus items due that
// day with no entry yet.
export function dailyEntries(todos, dateStr) {
  return todos
    .filter((t) => isDueOn(t, dateStr) || t.completions[dateStr])
    .map((t) => ({
      todo: t,
      status: t.completions[dateStr] || null,
      note: t.notes?.[dateStr],
      duration: t.durations?.[dateStr],
    }));
}

function countStatuses(entries) {
  const totals = { done: 0, missed: 0, skipped: 0, none: 0 };
  entries.forEach((e) => {
    totals[e.status || 'none'] += 1;
  });
  return totals;
}

// One summary object per date in `dates` (array of YYYY-MM-DD, may contain
// null for calendar blanks).
export function summariesForDates(todos, dates) {
  return dates.map((dateStr) => {
    if (!dateStr) return null;
    const entries = dailyEntries(todos, dateStr);
    return { date: dateStr, ...countStatuses(entries), total: entries.length };
  });
}

// Group entries by todo type (One-time / Daily / Weekly / etc.) for a breakdown view.
export function byCategory(entries) {
  const groups = {};
  entries.forEach((e) => {
    const label = TYPE_LABELS[e.todo.type] || e.todo.type;
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  });
  const order = Object.values(TYPE_LABELS);
  return order.filter((label) => groups[label]).map((label) => [label, groups[label]]);
}
