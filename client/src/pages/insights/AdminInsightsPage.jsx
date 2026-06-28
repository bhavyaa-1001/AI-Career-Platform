import { useState } from 'react';
import { motion } from 'framer-motion';

import {
  InsightsAreaChart, InsightsBarChart, InsightsPieChart, objectToPieData, RecentList,
} from '@/components/insights/InsightsCharts';
import { defaultDateRange } from '@/components/insights/chartTheme';
import { InsightsFilters, InsightsSection, StatGrid } from '@/components/insights/InsightsLayout';
import { Loader } from '@/components/common';
import { insightsApi } from '@/lib/api/insights';
import { downloadInsightsExport, useAdminInsights } from '@/hooks/useInsights';

export function AdminInsightsPage() {
  const defaults = defaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [params, setParams] = useState({ from: defaults.from, to: defaults.to });
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useAdminInsights(params);
  const insights = data?.data?.insights;

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await downloadInsightsExport(
        insightsApi.exportAdmin,
        { ...params, format },
        `admin-analytics.${format}`,
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
        <h1 className="text-2xl font-bold tracking-tight">Admin Analytics</h1>
        <p className="mt-1 text-muted-foreground">Platform-wide usage, growth, and activity</p>
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
        { label: 'Total Users', value: s.totalUsers ?? 0 },
        { label: 'Jobs', value: s.totalJobs ?? 0 },
        { label: 'Applications', value: s.totalApplications ?? 0 },
        { label: 'Resume Analyses', value: s.totalAnalyses ?? 0 },
        { label: 'Coding Submissions', value: s.totalSubmissions ?? 0 },
        { label: 'Published Problems', value: s.publishedProblems ?? 0 },
      ]} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsPieChart title="Users by Role" data={objectToPieData(insights?.users?.byRole)} />
        <InsightsPieChart title="Applications by Status" data={objectToPieData(insights?.platform?.applicationsByStatus)} />
      </div>

      <InsightsSection title="Platform Activity">
        <div className="grid gap-6 lg:grid-cols-3">
          <InsightsAreaChart
            title="Daily Activity"
            data={insights?.platform?.activityOverTime || []}
            xKey="date"
            yKey="count"
          />
          <InsightsAreaChart
            title="Coding Submissions"
            data={insights?.platform?.submissionsOverTime || []}
            xKey="date"
            yKey="count"
          />
          <InsightsAreaChart
            title="Resume Analyses"
            data={insights?.platform?.analysesOverTime || []}
            xKey="date"
            yKey="count"
          />
        </div>
      </InsightsSection>

      <InsightsSection title="User Growth">
        <InsightsBarChart
          title="New Users by Month"
          data={insights?.users?.growth || []}
          xKey="month"
          yKey="count"
        />
      </InsightsSection>

      <RecentList
        title="Recent Platform Activity"
        items={insights?.recentActivities}
        renderItem={(a) => (
          <div key={a.id} className="rounded border border-border p-3 text-sm">
            <p className="font-medium">{a.description}</p>
            <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
          </div>
        )}
      />
    </div>
  );
}
