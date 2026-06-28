import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  CHART_COLORS, chartAxisStyle, chartGridStyle, chartTooltipStyle,
} from '@/components/insights/chartTheme';

export function InsightsLineChart({ title, data, xKey, lines, height = 260 }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid {...chartGridStyle} />
            <XAxis dataKey={xKey} tick={chartAxisStyle} />
            <YAxis tick={chartAxisStyle} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend />
            {lines.map((l, i) => (
              <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function InsightsBarChart({ title, data, xKey, yKey, height = 260, colorIndex = 0 }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid {...chartGridStyle} />
            <XAxis dataKey={xKey} tick={chartAxisStyle} />
            <YAxis tick={chartAxisStyle} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey={yKey} fill={CHART_COLORS[colorIndex]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function InsightsAreaChart({ title, data, xKey, yKey, height = 260 }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid {...chartGridStyle} />
            <XAxis dataKey={xKey} tick={chartAxisStyle} />
            <YAxis tick={chartAxisStyle} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Area type="monotone" dataKey={yKey} stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function InsightsPieChart({ title, data, nameKey = 'name', valueKey = 'value', height = 260 }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatmapChart({ title, data, height = 120 }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1" style={{ minHeight: height }}>
          {data.slice(-90).map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.count}`}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: `hsl(var(--primary) / ${0.15 + (d.count / max) * 0.85})` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function objectToPieData(obj) {
  return Object.entries(obj || {}).map(([name, value]) => ({ name, value }));
}

export function RecentList({ title, items, renderItem }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items?.length ? items.map(renderItem) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No data in this range</p>
        )}
      </CardContent>
    </Card>
  );
}
