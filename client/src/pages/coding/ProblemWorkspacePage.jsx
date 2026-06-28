import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { CodeEditor } from '@/components/coding/CodeEditor';
import { EditorToolbar } from '@/components/coding/EditorToolbar';
import { HintPanel, CodeReviewPanel } from '@/components/coding/HintReviewPanels';
import { ProblemDescription } from '@/components/coding/ProblemDescription';
import { TestResultsPanel } from '@/components/coding/TestResultsPanel';
import { Loader } from '@/components/common';
import { Button } from '@/components/ui';
import { codingApi } from '@/lib/api/coding';
import { setProblemCode } from '@/features/coding/editorSlice';
import { useCodingMutations, useHintSession, useProblem } from '@/hooks/useCoding';
import { cn } from '@/lib/utils';

export function ProblemWorkspacePage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { data, isLoading, refetch } = useProblem(slug);
  const { data: hintData } = useHintSession(data?.data?.problem?.id);
  const { language, isFullscreen } = useSelector((s) => s.editor);
  const { runCode, submitCode, saveDraft, toggleBookmark, toggleFavorite, codeReview, requestHint, requestDryRun, requestVisual } = useCodingMutations();

  const problem = data?.data?.problem;
  const userState = data?.data?.userState;
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [activeTab, setActiveTab] = useState('results');
  const [error, setError] = useState(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    if (!problem) return;
    const init = async () => {
      try {
        const draftRes = await codingApi.getDraft(problem.id);
        const draft = draftRes?.data?.draft;
        const starter = problem.starterCode?.[language] || Object.values(problem.starterCode || {})[0] || '';
        setCode(draft?.sourceCode || starter);
      } catch {
        const starter = problem.starterCode?.[language] || '';
        setCode(starter);
      }
    };
    init();
  }, [problem?.id, language]);

  useEffect(() => {
    if (!problem?.id || !code) return;
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      saveDraft.mutate({ problemId: problem.id, language, sourceCode: code });
      dispatch(setProblemCode({ problemId: problem.id, code }));
    }, 3000);
    return () => clearTimeout(autoSaveRef.current);
  }, [code, problem?.id, language]);

  const handleRun = useCallback(async () => {
    setError(null);
    try {
      const res = await runCode.mutateAsync({ slug, language, sourceCode: code });
      setResult(res.data.submission);
      setActiveTab('results');
    } catch (err) {
      setError(err.message);
    }
  }, [slug, language, code, runCode]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const res = await submitCode.mutateAsync({ slug, language, sourceCode: code });
      setResult(res.data.submission);
      setActiveTab('results');
      refetch();
    } catch (err) {
      setError(err.message);
    }
  }, [slug, language, code, submitCode, refetch]);

  const handleReset = () => {
    const starter = problem?.starterCode?.[language] || '';
    setCode(starter);
    setResult(null);
  };

  const handleCopy = () => navigator.clipboard.writeText(code);

  if (isLoading) return <Loader className="py-20" />;
  if (!problem) return <p className="text-destructive">Problem not found</p>;

  const hintSession = hintData?.data?.session;
  const containerClass = cn('flex flex-col', isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-[calc(100vh-8rem)]');

  return (
    <div className={containerClass}>
      <div className="mb-2 flex items-center gap-2 px-1">
        <Link to="/coding/problems"><Button variant="ghost" size="sm">← Problems</Button></Link>
        <span className="text-sm font-medium">{problem.title}</span>
      </div>

      <div className="grid min-h-0 flex-1 gap-0 border border-border lg:grid-cols-2">
        <div className="overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
          <ProblemDescription
            problem={problem}
            userState={userState}
            onBookmark={() => toggleBookmark.mutate(problem.id, { onSuccess: refetch })}
            onFavorite={() => toggleFavorite.mutate(problem.id, { onSuccess: refetch })}
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <EditorToolbar
            onRun={handleRun}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onCopy={handleCopy}
            onSaveDraft={() => saveDraft.mutate({ problemId: problem.id, language, sourceCode: code })}
            isRunning={runCode.isPending}
            isSubmitting={submitCode.isPending}
            isSaving={saveDraft.isPending}
          />
          <div className="min-h-0 flex-1">
            <CodeEditor value={code} onChange={setCode} height="100%" />
          </div>

          <div className="border-t border-border">
            <div className="flex gap-1 border-b border-border px-2">
              {['results', 'hints', 'review'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn('px-3 py-2 text-xs capitalize', activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground')}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {activeTab === 'results' && <TestResultsPanel submission={result} />}
              {activeTab === 'hints' && (
                <div className="p-2">
                  <HintPanel
                    hintsUsed={hintSession?.hintsUsed || 0}
                    history={hintSession?.history || []}
                    isLoading={requestHint.isPending || requestDryRun.isPending}
                    onRequestHint={(level) => requestHint.mutateAsync({ problemId: problem.id, level })}
                    onDryRun={async () => requestDryRun.mutateAsync({ problemId: problem.id, language, sourceCode: code })}
                    onVisual={async () => requestVisual.mutateAsync({ problemId: problem.id })}
                  />
                </div>
              )}
              {activeTab === 'review' && (
                <div className="p-2">
                  <CodeReviewPanel
                    review={review}
                    isLoading={codeReview.isPending}
                    onRequest={async () => {
                      const res = await codeReview.mutateAsync({ problemId: problem.id, language, sourceCode: code });
                      setReview(res.data.review);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {error && <p className="px-3 py-1 text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
