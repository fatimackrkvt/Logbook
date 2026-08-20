// Date helpers work with plain "YYYY-MM-DD" strings to keep storage/comparison simple.

export function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function dayOfWeek(dateStr) {
  // 0 = Sunday ... 6 = Saturday
  return new Date(dateStr + 'T00:00:00').getDay();
}

// Returns the start (Mon) of the ISO week containing dateStr, as YYYY-MM-DD
export function weekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return todayStr(d);
}

export function monthStart(dateStr) {
  return dateStr.slice(0, 7) + '-01';
}

function daysBetween(a, b) {
  const ms = new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00');
  return Math.round(ms / 86400000);
}

// Determines whether a fixed-schedule todo (daily/weekly/interval/once) is
// "on the agenda" for the given date. Frequency-type todos are always shown
// (they're judged by count, not by day), and handled separately.
export function isDueOn(todo, dateStr) {
  if (todo.type === 'once') {
    return todo.dueDate === dateStr;
  }
  if (todo.type === 'daily') {
    return dateStr >= todo.createdAt;
  }
  if (todo.type === 'weekly') {
    return dateStr >= todo.createdAt && todo.daysOfWeek.includes(dayOfWeek(dateStr));
  }
  if (todo.type === 'interval') {
    if (dateStr < todo.createdAt) return false;
    return daysBetween(todo.createdAt, dateStr) % todo.intervalDays === 0;
  }
  if (todo.type === 'frequency') {
    return dateStr >= todo.createdAt; // always eligible; progress tracked separately
  }
  return false;
}

// For 'frequency' todos: how many completions fall in the current period
// (week or month) containing dateStr.
export function frequencyProgress(todo, dateStr) {
  const periodStart = todo.frequencyPeriod === 'month' ? monthStart(dateStr) : weekStart(dateStr);
  const count = Object.entries(todo.completions || {}).filter(
    ([d, status]) => d >= periodStart && d <= dateStr && status === 'done'
  ).length;
  return { done: count, target: todo.frequencyCount, periodStart };
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
