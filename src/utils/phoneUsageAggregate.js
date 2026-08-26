import { weekStart } from './recurrence';

export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function effectiveWeekStart(entry) {
  return entry.mode === 'weekly' ? entry.weekStart : weekStart(entry.date);
}

// Groups all entries by the week they fall in, newest week first. Each group
// includes a per-category minute breakdown and the raw entries for drill-down.
export function weeklySummaries(entries, categories) {
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || 'Unknown';

  const groups = {};
  entries.forEach((e) => {
    const wk = effectiveWeekStart(e);
    if (!groups[wk]) groups[wk] = [];
    groups[wk].push(e);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([wk, weekEntries]) => {
      const totalMinutes = weekEntries.reduce((sum, e) => sum + e.minutes, 0);
      const byCategoryMap = {};
      weekEntries.forEach((e) => {
        byCategoryMap[e.categoryId] = (byCategoryMap[e.categoryId] || 0) + e.minutes;
      });
      const byCategory = Object.entries(byCategoryMap)
        .map(([categoryId, minutes]) => ({ categoryId, name: categoryName(categoryId), minutes }))
        .sort((a, b) => b.minutes - a.minutes);

      return {
        weekStart: wk,
        totalMinutes,
        byCategory,
        entries: weekEntries.sort((a, b) => b.minutes - a.minutes),
      };
    });
}
