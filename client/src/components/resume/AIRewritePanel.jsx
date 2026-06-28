import { useState } from 'react';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '@/components/ui';
import { useResumeRewrite } from '@/hooks/useResumeRewrite';

const REWRITE_MODES = [
  { id: 'summary', label: 'Professional Summary', desc: 'Compelling ATS summary' },
  { id: 'experience', label: 'Experience', desc: 'Stronger bullet points' },
  { id: 'projects', label: 'Projects', desc: 'Impact-focused descriptions' },
  { id: 'achievements', label: 'Achievements', desc: 'Results-oriented entries' },
  { id: 'grammar', label: 'Grammar', desc: 'Fix spelling & clarity' },
  { id: 'actionVerbs', label: 'Action Verbs', desc: 'Power verbs & metrics' },
  { id: 'keywords', label: 'Keywords', desc: 'ATS keyword optimization' },
];

export function AIRewritePanel({
  resumeId,
  onPreview,
  onApplyLocal,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  const { generate, apply } = useResumeRewrite(resumeId);
  const [targetRole, setTargetRole] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [selectedMode, setSelectedMode] = useState('summary');
  const [rewriteResult, setRewriteResult] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [error, setError] = useState(null);
  const [applyStatus, setApplyStatus] = useState(null);

  const handleGenerate = async (mode = selectedMode) => {
    setError(null);
    setApplyStatus(null);
    setSelectedMode(mode);
    try {
      const res = await generate.mutateAsync({
        mode,
        targetRole: targetRole.trim() || undefined,
        targetJobDescription: targetJobDescription.trim() || undefined,
      });
      const result = res.data;
      setRewriteResult(result);
      setPreviewActive(true);
      onPreview(result.updatedContent);
    } catch (err) {
      setError(err.message);
      setPreviewActive(false);
      onPreview(null);
    }
  };

  const handleDiscardPreview = () => {
    setPreviewActive(false);
    setRewriteResult(null);
    onPreview(null);
  };

  const handleApply = async () => {
    if (!rewriteResult?.updatedContent) return;
    setError(null);
    setApplyStatus('Applying…');
    try {
      onApplyLocal(rewriteResult.updatedContent);
      await apply.mutateAsync({
        content: rewriteResult.updatedContent,
        versionLabel: `AI: ${rewriteResult.modeLabel}`,
      });
      setApplyStatus('Applied');
      setPreviewActive(false);
      setRewriteResult(null);
      onPreview(null);
    } catch (err) {
      setApplyStatus(null);
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">AI Resume Rewrite</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Improve sections with Gemini. Preview changes, then one-click apply. Undo/redo available after apply.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Target role (optional)</label>
        <Input
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
        />
      </div>
      <Textarea
        value={targetJobDescription}
        onChange={(e) => setTargetJobDescription(e.target.value)}
        placeholder="Paste job description for keyword optimization..."
        rows={3}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        {REWRITE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => handleGenerate(mode.id)}
            disabled={generate.isPending}
            className={`rounded-lg border p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/30 ${selectedMode === mode.id && rewriteResult ? 'border-primary bg-primary/5' : 'border-border'}`}
          >
            <p className="text-sm font-medium">{mode.label}</p>
            <p className="text-xs text-muted-foreground">{mode.desc}</p>
          </button>
        ))}
      </div>

      {generate.isPending && (
        <p className="text-sm text-muted-foreground">Generating AI rewrite…</p>
      )}

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {rewriteResult && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">
                Preview: {rewriteResult.modeLabel}
                {previewActive && <Badge className="ml-2" variant="secondary">Live</Badge>}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleDiscardPreview}>
                  Discard
                </Button>
                <Button type="button" size="sm" onClick={handleApply} disabled={apply.isPending}>
                  {apply.isPending ? 'Applying…' : 'One-Click Apply'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {applyStatus === 'Applied' && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved to version history.</p>
            )}
            {rewriteResult.changes?.length > 0 ? (
              <ul className="max-h-64 space-y-3 overflow-y-auto">
                {rewriteResult.changes.map((change, i) => (
                  <li key={i} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium">{change.label || change.section}</p>
                    {change.before && (
                      <p className="mt-1 text-muted-foreground line-through">{change.before}</p>
                    )}
                    {change.after && (
                      <p className="mt-1 text-primary">{change.after}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Preview active in the live preview panel →</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
          Undo
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
          Redo
        </Button>
      </div>
    </div>
  );
}
