import { useCallback, useEffect, useRef, useState } from 'react';

import { Link, useNavigate, useParams } from 'react-router-dom';



import { AIRewritePanel } from '@/components/resume/AIRewritePanel';

import { ThemeCustomizer, TemplatePicker } from '@/components/resume/ResumeCustomizer';

import { ResumePreview } from '@/components/resume/ResumePreview';

import { SectionEditor } from '@/components/resume/SectionEditor';

import { SortableSectionList } from '@/components/resume/SortableSectionList';

import { VersionHistoryPanel } from '@/components/resume/VersionHistoryPanel';

import { Loader } from '@/components/common';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';

import { RESUME_SECTIONS } from '@/features/resume/constants';

import { getTemplateDefaults } from '@/features/resume/templateRegistry';

import { useAnalysisMutations } from '@/hooks/useResumeAnalysis';

import { useResume, useResumeMutations } from '@/hooks/useResume';

import { useUndoRedo } from '@/hooks/useUndoRedo';



const AUTOSAVE_DELAY = 2000;

const BUILDER_TABS = ['content', 'ai', 'design', 'sections', 'history'];



export function ResumeBuilderPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { data, isLoading, error } = useResume(id);

  const { autosave, update } = useResumeMutations();

  const { analyzeResume } = useAnalysisMutations();



  const [resume, setResume] = useState(null);

  const [activeSection, setActiveSection] = useState('personalInfo');

  const [activeTab, setActiveTab] = useState('content');

  const [saveStatus, setSaveStatus] = useState('saved');

  const [analyzeError, setAnalyzeError] = useState(null);

  const [previewContent, setPreviewContent] = useState(null);

  const [historyTick, setHistoryTick] = useState(0);

  const timerRef = useRef(null);

  const resumeRef = useRef(null);



  const contentHistory = useUndoRedo(null);



  // Sync when resume is loaded/refetched; contentHistory is stable
  useEffect(() => {

    if (data?.data?.resume) {

      setResume(data.data.resume);

      resumeRef.current = data.data.resume;

      contentHistory.syncExternal(data.data.resume.content);

      setPreviewContent(null);

    }

  }, [data]);



  const bumpHistory = () => setHistoryTick((n) => n + 1);



  const scheduleAutosave = useCallback(() => {

    setSaveStatus('unsaved');

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {

      const current = resumeRef.current;

      if (!current?.id) return;

      setSaveStatus('saving');

      try {

        await autosave.mutateAsync({

          id: current.id,

          data: {

            title: current.title,

            template: current.template,

            settings: current.settings,

            sectionOrder: current.sectionOrder,

            sectionVisibility: current.sectionVisibility,

            content: current.content,

          },

        });

        setSaveStatus('saved');

      } catch {

        setSaveStatus('error');

      }

    }, AUTOSAVE_DELAY);

  }, [autosave]);



  const applyContent = useCallback((nextContent, { recordHistory = true } = {}) => {

    contentHistory.commit(nextContent, { recordHistory });

    bumpHistory();

    setResume((prev) => {

      const next = { ...prev, content: nextContent };

      resumeRef.current = next;

      return next;

    });

    scheduleAutosave();

  }, [contentHistory, scheduleAutosave]);



  const patchResume = useCallback((patch) => {

    setResume((prev) => {

      const next = { ...prev, ...patch };

      resumeRef.current = next;

      return next;

    });

    scheduleAutosave();

  }, [scheduleAutosave]);



  const patchContent = useCallback((contentPatch) => {

    const base = resumeRef.current?.content;

    if (!base) return;

    applyContent({ ...base, ...contentPatch }, { recordHistory: true });

  }, [applyContent]);



  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);



  const handleManualSave = async () => {

    if (!resume) return;

    setSaveStatus('saving');

    try {

      await update.mutateAsync({ id: resume.id, data: resume });

      setSaveStatus('saved');

    } catch {

      setSaveStatus('error');

    }

  };



  const handleAnalyze = async () => {

    if (!resume?.id) return;

    setAnalyzeError(null);

    try {

      const res = await analyzeResume.mutateAsync({ resumeId: resume.id });

      navigate(`/analytics/${res.data.analysis.id}`);

    } catch (err) {

      setAnalyzeError(err.message);

    }

  };



  const handleUndo = () => {

    const prev = contentHistory.undo();

    if (!prev) return;

    bumpHistory();

    setResume((r) => {

      const next = { ...r, content: prev };

      resumeRef.current = next;

      return next;

    });

    setPreviewContent(null);

    scheduleAutosave();

  };



  const handleRedo = () => {

    const nextContent = contentHistory.redo();

    if (!nextContent) return;

    bumpHistory();

    setResume((r) => {

      const next = { ...r, content: nextContent };

      resumeRef.current = next;

      return next;

    });

    setPreviewContent(null);

    scheduleAutosave();

  };



  const handleRewritePreview = (content) => setPreviewContent(content);



  const handleRewriteApplyLocal = (content) => {

    setPreviewContent(null);

    applyContent(content, { recordHistory: true });

  };



  if (isLoading) return <Loader className="py-20" />;

  if (error || !resume) {

    return (

      <div className="py-20 text-center">

        <p className="text-muted-foreground">Resume not found.</p>

        <Button className="mt-4" onClick={() => navigate('/resumes')}>Back to Resumes</Button>

      </div>

    );

  }



  const sectionLabel = RESUME_SECTIONS.find((s) => s.id === activeSection)?.label || activeSection;

  const displayResume = previewContent

    ? { ...resume, content: previewContent }

    : resume;



  void historyTick;



  return (

    <div className="space-y-4">

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <Link to="/resumes" className="text-sm text-muted-foreground hover:text-foreground">← Resumes</Link>

          <Input

            value={resume.title}

            onChange={(e) => patchResume({ title: e.target.value })}

            className="h-9 max-w-xs border-none bg-transparent text-lg font-semibold shadow-none focus-visible:ring-0"

          />

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <span className="text-xs text-muted-foreground">

            {saveStatus === 'saving' && 'Saving...'}

            {saveStatus === 'saved' && 'All changes saved'}

            {saveStatus === 'unsaved' && 'Unsaved changes'}

            {saveStatus === 'error' && 'Save failed'}

          </span>

          <Button type="button" variant="outline" size="sm" onClick={handleUndo} disabled={!contentHistory.canUndo()}>

            Undo

          </Button>

          <Button type="button" variant="outline" size="sm" onClick={handleRedo} disabled={!contentHistory.canRedo()}>

            Redo

          </Button>

          <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('ai')}>

            AI Rewrite

          </Button>

          <Button type="button" variant="outline" size="sm" onClick={handleAnalyze} disabled={analyzeResume.isPending}>

            {analyzeResume.isPending ? 'Analyzing…' : 'AI Analyze'}

          </Button>

          {analyzeError && <span className="text-xs text-destructive">{analyzeError}</span>}

          <Button type="button" variant="outline" size="sm" onClick={handleManualSave}>Save</Button>

        </div>

      </div>



      {previewContent && (

        <div className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-sm text-primary">

          AI preview active — review changes in the live preview, then apply or discard in the AI tab.

        </div>

      )}



      <div className="grid gap-6 xl:grid-cols-2">

        <div className="space-y-4">

          <Card>

            <CardHeader className="pb-3">

              <div className="flex flex-wrap gap-2 border-b border-border pb-3">

                {BUILDER_TABS.map((tab) => (

                  <button

                    key={tab}

                    type="button"

                    onClick={() => setActiveTab(tab)}

                    className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}

                  >

                    {tab === 'ai' ? 'AI Improve' : tab}

                  </button>

                ))}

              </div>

            </CardHeader>

            <CardContent>

              {activeTab === 'content' && (

                <div className="space-y-4">

                  <CardTitle className="text-base">{sectionLabel}</CardTitle>

                  <SectionEditor section={activeSection} content={resume.content} onChange={patchContent} />

                </div>

              )}

              {activeTab === 'ai' && (

                <AIRewritePanel

                  resumeId={resume.id}

                  onPreview={handleRewritePreview}

                  onApplyLocal={handleRewriteApplyLocal}

                  onUndo={handleUndo}

                  onRedo={handleRedo}

                  canUndo={contentHistory.canUndo()}

                  canRedo={contentHistory.canRedo()}

                />

              )}

              {activeTab === 'design' && (

                <div className="space-y-6">

                  <div>

                    <h4 className="mb-3 text-sm font-medium">Template</h4>

                    <TemplatePicker

                      value={resume.template}

                      onChange={(template) => {

                        const defaults = getTemplateDefaults(template);

                        patchResume({

                          template: defaults.template,

                          settings: { ...resume.settings, ...defaults.settings },

                        });

                      }}

                    />

                  </div>

                  <div>

                    <h4 className="mb-3 text-sm font-medium">Theme & Colors</h4>

                    <ThemeCustomizer

                      settings={resume.settings}

                      templateId={resume.template}

                      onChange={(settings) => patchResume({ settings })}

                    />

                  </div>

                </div>

              )}

              {activeTab === 'sections' && (

                <SortableSectionList

                  sectionOrder={resume.sectionOrder}

                  sectionVisibility={resume.sectionVisibility}

                  activeSection={activeSection}

                  onReorder={(sectionOrder) => patchResume({ sectionOrder })}

                  onSelect={setActiveSection}

                  onToggleVisibility={(sid) => patchResume({

                    sectionVisibility: { ...resume.sectionVisibility, [sid]: !resume.sectionVisibility[sid] },

                  })}

                />

              )}

              {activeTab === 'history' && <VersionHistoryPanel resumeId={resume.id} />}

            </CardContent>

          </Card>



          {activeTab === 'content' && (

            <Card>

              <CardHeader><CardTitle className="text-base">Sections</CardTitle></CardHeader>

              <CardContent>

                <SortableSectionList

                  sectionOrder={resume.sectionOrder}

                  sectionVisibility={resume.sectionVisibility}

                  activeSection={activeSection}

                  onReorder={(sectionOrder) => patchResume({ sectionOrder })}

                  onSelect={(s) => { setActiveSection(s); setActiveTab('content'); }}

                  onToggleVisibility={(sid) => patchResume({

                    sectionVisibility: { ...resume.sectionVisibility, [sid]: !resume.sectionVisibility[sid] },

                  })}

                />

              </CardContent>

            </Card>

          )}

        </div>



        <div className="xl:sticky xl:top-4 xl:self-start">

          <Card>

            <CardHeader>

              <CardTitle className="text-base">

                {previewContent ? 'AI Preview' : 'Live Preview'}

              </CardTitle>

            </CardHeader>

            <CardContent className="p-2 sm:p-4">

              <ResumePreview resume={displayResume} resumeId={resume.id} useLiveState={!previewContent} />

            </CardContent>

          </Card>

        </div>

      </div>

    </div>

  );

}


