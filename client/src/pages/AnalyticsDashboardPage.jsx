import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { AnalysisHistoryList } from '@/components/analysis/AnalysisResults';
import { ScoreGauge } from '@/components/analysis/ScoreGauge';
import { StatCard } from '@/components/dashboard';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAnalytics, useAnalysisStatus } from '@/hooks/useResumeAnalysis';

export function AnalyticsDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useAnalytics();
  const { data: statusData } = useAnalysisStatus();

  if (isLoading) return <Loader className="py-20" />;

  if (isError) {
    return (
      <div className="text-center">
        <p className="text-destructive">{error.message}</p>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const analytics = data?.data?.analytics;

  if (!analytics) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Unable to load analytics data.</p>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const configured = statusData?.data?.configured ?? true;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Analytics</h1>
            <p className="mt-1 text-muted-foreground">
              Track ATS scores, grammar quality, and AI insights across your resume analyses.
            </p>
          </div>
          <Link to="/analysis">
            <Button>Analyze Resume</Button>
          </Link>
        </div>
      </motion.div>

      {!configured && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-400">
            Gemini AI is not configured. Add <code className="rounded bg-muted px-1">GEMINI_API_KEY</code> to enable analysis.
          </CardContent>
        </Card>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Total Analyses" value={analytics.totalAnalyses} trend="All time" icon={<span className="text-lg">📊</span>} />
        <StatCard label="Avg ATS Score" value={`${analytics.avgAtsScore}%`} trend="Across analyses" icon={<span className="text-lg">🎯</span>} />
        <StatCard label="Avg Grammar" value={`${analytics.avgGrammarScore}%`} trend="Writing quality" icon={<span className="text-lg">✍️</span>} />
        <StatCard
          label="Last Score"
          value={analytics.lastAnalysis ? `${analytics.lastAnalysis.atsScore}%` : '—'}
          trend={analytics.lastAnalysis ? 'Most recent ATS' : 'No analyses yet'}
          icon={<span className="text-lg">📈</span>}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Score History</CardTitle></CardHeader>
            <CardContent>
              {analytics.scoreHistory?.length ? (
                <div className="space-y-3">
                  {analytics.scoreHistory.map((entry) => (
                    <Link
                      key={entry.id}
                      to={`/analytics/${entry.id}`}
                      className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.label}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span><strong>{entry.atsScore}</strong> ATS</span>
                        <span className="text-muted-foreground"><strong>{entry.grammarScore}</strong> Grammar</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No score history yet. <Link to="/analysis" className="text-primary hover:underline">Analyze your first resume</Link>.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Analysis History</CardTitle></CardHeader>
            <CardContent>
              <AnalysisHistoryList analyses={analytics.recentAnalyses} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {analytics.lastAnalysis && (
            <Card>
              <CardHeader><CardTitle>Latest Analysis</CardTitle></CardHeader>
              <CardContent className="flex justify-around py-4">
                <ScoreGauge score={analytics.lastAnalysis.atsScore} label="ATS" />
                <ScoreGauge score={analytics.lastAnalysis.grammar?.score} label="Grammar" />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Top Missing Skills</CardTitle></CardHeader>
            <CardContent>
              {analytics.topMissingSkills?.length ? (
                <div className="space-y-2">
                  {analytics.topMissingSkills.map(({ skill, count }) => (
                    <div key={skill} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <span className="text-sm capitalize">{skill}</span>
                      <Badge variant="outline">{count}×</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">Run analyses to see skill gaps.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
