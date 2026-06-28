export const CHART_COLORS = [
  'hsl(var(--primary))',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#64748b',
];

export const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

export const chartAxisStyle = {
  fontSize: 11,
  fill: 'hsl(var(--muted-foreground))',
};

export const chartGridStyle = {
  stroke: 'hsl(var(--border))',
  strokeDasharray: '3 3',
};

export const formatPercent = (v) => `${v}%`;

export const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

export const defaultDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};
