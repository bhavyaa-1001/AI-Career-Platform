export const parseDateRange = ({ from, to } = {}) => {
  const range = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) range.from = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      range.to = d;
    }
  }
  return range;
};

export const buildDateFilter = (from, to, field = 'createdAt') => {
  const filter = {};
  if (from || to) {
    filter[field] = {};
    if (from) filter[field].$gte = from;
    if (to) filter[field].$lte = to;
  }
  return filter;
};

export const mergeMatch = (base, dateFilter) => ({ ...base, ...dateFilter });

export const calcRate = (num, den) => (den ? Math.round((num / den) * 100) : 0);

export const monthKey = (date) => new Date(date).toISOString().slice(0, 7);

export const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

export const bucketByMonth = (items, dateField = 'createdAt', valueField = null) => {
  const buckets = {};
  items.forEach((item) => {
    const key = monthKey(item[dateField]);
    if (valueField) {
      buckets[key] = (buckets[key] || 0) + (item[valueField] || 0);
    } else {
      buckets[key] = (buckets[key] || 0) + 1;
    }
  });
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value }));
};

export const topCounts = (entries, limit = 8) =>
  Object.entries(entries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
