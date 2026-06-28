import { useState } from 'react';
import { motion } from 'framer-motion';

import {
  ActivityHeatmapChart, InsightsBarChart, InsightsLineChart,
  InsightsPieChart, objectToPieData, RecentList,
} from '@/components/insights/InsightsCharts';
import { defaultDateRange } from '@/components/insights/chartTheme';
import { InsightsFilters, InsightsSection, StatGrid } from '@/components/insights/InsightsLayout';
import { Loader } from '@/components/common';
import { Badge } from '@/components/ui';
import { insightsApi } from '@/lib/api/insights';
import { downloadInsightsExport, useStudentInsights } from '@/hooks/useInsights';

export function StudentInsightsPage() {
  const defaults = defaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [params, setParams] = useState({ from: defaults.from, to: defaults.to });
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, refetch } = useStudentInsights(params);
  const insights = data?.data?.insights;

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await downloadInsightsExport(
        insightsApi.exportStudent,
        { ...params, format },
        `student-analytics.${format}`,
      );
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <Loader className="py-20" />;

  const s = insights?.summary || {};

  const statCards = [
    { label: 'Applications', value: s.applications ?? 0 },
    { label: 'Avg ATS Score', value: `${s.avgAtsScore ?? 0}%` },
    { label: 'Avg Job Match', value: `${s.avgMatchScore ?? 0}%` },
    { label: 'Coding Acceptance', value: `${s.codingAcceptanceRate ?? 0}%` },
    { label: 'Problems Solved', value: s.totalSolved ?? 0, hint: `${s.currentStreak ?? 0} day streak` },
  ];

  const resumeHistory = (insights?.resumeScores?.history || []).map((r) => ({
    date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    ats: r.atsScore,
    grammar: r.grammarScore,
  }));

  const matchHistory = (insights?.jobMatchHistory || []).map((m) => ({
    label: m.jobTitle?.slice(0, 12) || 'Role',
    score: m.matchScore,
  }));

  const codingTrend = (insights?.codingProgress?.submissionTrend || []).map((r) => ({
    date: r.date?.slice(5),
    total: r.total,
    accepted: r.accepted,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Student Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Unified view of applications, resume scores, coding, interviews, and learning progress.
        </p>
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

      <StatGrid stats={statCards} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsLineChart
          title="Resume Scores Over Time"
          data={resumeHistory}
          xKey="date"
          lines={[
            { key: 'ats', name: 'ATS' },
            { key: 'grammar', name: 'Grammar' },
          ]}
        />
        <InsightsBarChart title="Job Match History" data={matchHistory} xKey="label" yKey="score" colorIndex={1} />
      </div>

      <InsightsSection title="Applications" description="Pipeline status and volume">
        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsPieChart title="Applications by Track Status" data={objectToPieData(insights?.applications?.byStatus)} />
          <InsightsBarChart
            title="Applications Over Time"
            data={insights?.applications?.overTime || []}
            xKey="month"
            yKey="count"
          />
        </div>
      </InsightsSection>

      <InsightsSection title="Coding Progress" description="Submissions, acceptance, and contests">
        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsLineChart
            title="Submission Trend"
            data={codingTrend}
            xKey="date"
            lines={[
              { key: 'total', name: 'Total' },
              { key: 'accepted', name: 'Accepted' },
            ]}
          />
          <InsightsPieChart
            title="Difficulty Solved"
            data={objectToPieData(insights?.codingProgress?.difficultySolved)}
          />
        </div>
      </InsightsSection>

      <InsightsSection title="Interview Performance">
        <StatGrid stats={[
          { label: 'Interviews', value: insights?.interviewPerformance?.interviews ?? 0 },
          { label: 'Offers', value: insights?.interviewPerformance?.offers ?? 0 },
          { label: 'Conversion', value: `${insights?.interviewPerformance?.conversionRate ?? 0}%` },
          { label: 'Assessments', value: insights?.interviewPerformance?.assessments ?? 0 },
        ]} />
      </InsightsSection>

      <InsightsSection title="Learning & Skill Growth">
        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsBarChart
            title="Suggested Learning Topics"
            data={(insights?.learningProgress?.topicsSuggested || []).map((t) => ({ name: t.name, count: t.count }))}
            xKey="name"
            yKey="count"
            colorIndex={4}
          />
          <InsightsLineChart
            title="Skill Score Trend"
            data={(insights?.skillGrowth || []).map((g) => ({ month: g.month, score: g.avgScore }))}
            xKey="month"
            lines={[{ key: 'score', name: 'Avg Score' }]}
          />
        </div>
      </InsightsSection>

      <div className="grid gap-6 lg:grid-cols-3">
        <ActivityHeatmapChart title="Activity Heatmap" data={insights?.heatmap || []} />
        <RecentList
          title="Recent Activities"
          items={insights?.recentActivities}
          renderItem={(a) => (
            <div key={a.id} className="rounded border border-border p-2 text-xs">
              <p className="font-medium">{a.description}</p>
              <p className="text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
          )}
        />
        <RecentList
          title="Notifications"
          items={insights?.notifications?.recent}
          renderItem={(n) => (
            <div key={n.id} className="flex items-start justify-between gap-2 rounded border border-border p-2 text-xs">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-muted-foreground">{n.message}</p>
              </div>
              {!n.isRead && <Badge variant="default">New</Badge>}
            </div>
          )}
        />
      </div>

      <InsightsSection title="Bookmarks">
        <StatGrid stats={[
          { label: 'Saved Jobs', value: insights?.bookmarks?.jobs ?? 0 },
          { label: 'Coding Bookmarks', value: insights?.bookmarks?.problems?.bookmarked ?? 0 },
          { label: 'Favorites', value: insights?.bookmarks?.problems?.favorites ?? 0 },
          { label: 'Problems Solved', value: insights?.bookmarks?.problems?.solved ?? 0 },
        ]} />
      </InsightsSection>

      <InsightsSection title="AI Resume History">
        <RecentList
          title=""
          items={insights?.aiResumeHistory}
          renderItem={(a) => (
            <div key={a.id} className="flex items-center justify-between rounded border border-border p-3 text-sm">
              <span>{a.title}</span>
              <span className="text-muted-foreground">ATS {a.atsScore}% · {new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        />
      </InsightsSection>

      <InsightsSection title="Contest Performance">
        <RecentList
          title=""
          items={insights?.contestPerformance}
          renderItem={(c) => (
            <div key={c.contestId} className="flex items-center justify-between rounded border border-border p-3 text-sm">
              <span>Contest {c.contestId.slice(-6)}</span>
              <span className="text-muted-foreground">Score {c.score} · Rank #{c.rank ?? '—'}</span>
            </div>
          )}
        />
      </InsightsSection>

      <InsightsSection title="Acceptance Rates">
        <StatGrid stats={[
          { label: 'Coding', value: `${insights?.acceptanceRate?.coding ?? 0}%` },
          { label: 'Applications', value: `${insights?.acceptanceRate?.applications ?? 0}%` },
          { label: 'Reject Rate', value: `${insights?.acceptanceRate?.rejectRate ?? 0}%` },
        ]} />
      </InsightsSection>

      <button type="button" className="text-sm text-primary hover:underline" onClick={() => refetch()}>Refresh data</button>
    </div>
  );
}
