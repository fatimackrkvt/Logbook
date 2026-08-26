export const TRIP_TYPES = {
  local: { label: 'Local (same city)' },
  domestic: { label: 'Same country' },
  abroad: { label: 'Abroad' },
};

// Inclusive day count, e.g. same start/end date = 1 day.
export function daySpan(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const days = Math.round((end - start) / 86400000) + 1;
  return days > 0 ? days : 1;
}

export function costPerDay(cost, startDate, endDate) {
  const days = daySpan(startDate, endDate);
  return days > 0 ? cost / days : cost;
}

export function formatCost(cost, currency) {
  const rounded = Math.round((cost + Number.EPSILON) * 100) / 100;
  return currency ? `${rounded} ${currency}` : `${rounded}`;
}
