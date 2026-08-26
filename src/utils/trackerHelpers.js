// Inclusive day count between two YYYY-MM-DD dates, e.g. same day = 1 day.
export function formatDaySpan(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const days = Math.round((end - start) / 86400000) + 1;
  if (days <= 0) return '';
  return `${days} day${days === 1 ? '' : 's'}`;
}

// Minutes between two "HH:MM" times, wrapping past midnight if timeB < timeA
// (e.g. bedtime 23:30 -> wake time 07:00 = 7h30m, not negative).
export function minutesBetweenTimes(timeA, timeB) {
  const [ah, am] = (timeA || '').split(':').map(Number);
  const [bh, bm] = (timeB || '').split(':').map(Number);
  if ([ah, am, bh, bm].some((n) => Number.isNaN(n))) return null;
  let mins = bh * 60 + bm - (ah * 60 + am);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

export const TEMPLATES = {
  range: {
    label: 'Range (start → end)',
    description: 'A title with a start and end date — good for books, courses, projects.',
  },
  event: {
    label: 'Event (date + duration)',
    description: 'A single dated activity with how long it took — good for chores, workouts, errands.',
  },
  dailyTwoTime: {
    label: 'Daily two-time',
    description: 'Two times per day, like bedtime/wake time — good for sleep, or any start/stop pair.',
  },
};
