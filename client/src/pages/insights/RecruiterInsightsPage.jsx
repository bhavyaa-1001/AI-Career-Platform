import { useState } from 'react';
import { motion } from 'framer-motion';

import {
  InsightsAreaChart, InsightsBarChart, InsightsLineChart, InsightsPieChart, objectToPieData, RecentList,
} from '@/components/insights/InsightsCharts';
import { defaultDateRange } from '@/components/insights/chartTheme';
import { InsightsFilters, InsightsSection, StatGrid } from '@/components/insights/InsightsLayout';
import { Loader } from '@/components/common';
import { insightsApi } from '@/lib/api/insights';
import { downloadInsightsExport, useRecruiterInsights } from '@/hooks/useInsights';

export function RecruiterInsightsPage() {
  const defaults = defaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [params, setParams] = useState({ from: defaults.from, to: defaults.to });
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useRecruiterInsights(params);
  const insights = data?.data?.insights;

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await downloadInsightsExport(
        insightsApi.exportRecruiter,
        { ...params, format },
        `recruiter-analytics.${format}`,
      );
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <Loader className="py-20" />;

  const s = insights?.summary || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Recruiter Analytics</h1>
        <p className="mt-1 text-muted-foreground">Hiring funnel, rankings, and job performance</p>
      </motion.div>

      <InsightsFilters
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onApply={() => setParams({ from, to })}
        onReset={() => {
          const d = defaultDateRange();
          setFrom(d.from);
          setTo(d.to);
          setParams(d);
        }}
        onExportCsv={() => handleExport('csv')}
        onExportPdf={() => handleExport('pdf')}
        isExporting={exporting}
      />

      <StatGrid stats={[
        { label: 'Total Jobs', value: s.totalJobs ?? 0 },
        { label: 'Open Jobs', value: s.openJobs ?? 0 },
        { label: 'Applications', value: s.totalApplications ?? 0 },
        { label: 'Shortlisted', value: s.shortlisted ?? 0 },
        { label: 'Acceptance Rate', value: `${s.acceptanceRate ?? 0}%` },
        { label: 'Avg Ranking', value: s.avgRankingScore ?? '—' },
      ]} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsPieChart title="Applications by Status" data={objectToPieData(insights?.applications?.byStatus)} />
        <InsightsPieChart title="Pipeline Track Status" data={objectToPieData(insights?.applications?.byTrackStatus)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsAreaChart
          title="Applications Over Time"
          data={insights?.applications?.overTime || []}
          xKey="date"
          yKey="count"
        />
        <InsightsLineChart
          title="Ranking Score Trend"
          data={insights?.ranking?.trend || []}
          xKey="month"
          lines={[{ key: 'avgScore', name: 'Avg Score' }]}
        />
      </div>

      <InsightsSection title="Top Jobs">
        <InsightsBarChart
          title="Applicants per Job"
          data={(insights?.jobs?.topPerformers || []).map((j) => ({ name: j.title?.slice(0, 14), count: j.applicantCount }))}
          xKey="name"
          yKey="count"
          colorIndex={2}
        />
      </InsightsSection>

      <InsightsSection title="Candidate Rankings">
        <InsightsBarChart
          title="Score Distribution"
          data={(insights?.ranking?.distribution || []).map((d) => ({ range: d.range, count: d.count }))}
          xKey="range"
          yKey="count"
          colorIndex={5}
        />
      </InsightsSection>

      <RecentList
        title="Recent Applications"
        items={insights?.applications?.recent}
        renderItem={(a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border p-3 text-sm">
            <div>
              <p className="font-medium">{a.jobTitle}</p>
              <p className="text-xs text-muted-foreground">{a.companyName}</p>
            </div>
            <span className="text-xs capitalize text-muted-foreground">{a.status} · {a.trackStatus}</span>
          </div>
        )}
      />
    </div>
  );
}
