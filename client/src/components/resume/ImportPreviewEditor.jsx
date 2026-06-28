import { useState } from 'react';

import { ResumePreview } from '@/components/resume/ResumePreview';
import { SectionEditor } from '@/components/resume/SectionEditor';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY, RESUME_SECTIONS } from '@/features/resume/constants';
import { getTemplateDefaults } from '@/features/resume/templateRegistry';

const IMPORT_SECTIONS = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects'];

export function ImportPreviewEditor({ parseResult, content, onContentChange, title, onTitleChange, onSave, saving }) {
  const [activeSection, setActiveSection] = useState('personalInfo');
  const stats = parseResult?.stats || {};

  const previewResume = {
    title,
    template: 'modern',
    settings: getTemplateDefaults('modern').settings,
    sectionOrder: DEFAULT_SECTION_ORDER,
    sectionVisibility: DEFAULT_SECTION_VISIBILITY,
    content,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">{stats.experience || 0} experience</Badge>
        <Badge variant="default">{stats.education || 0} education</Badge>
        <Badge variant="default">{stats.skills || 0} skills</Badge>
        <Badge variant="default">{stats.projects || 0} projects</Badge>
        {parseResult?.fileType && (
          <Badge variant="outline">{parseResult.fileType.toUpperCase()}</Badge>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Parsed Fields</CardTitle>
              <p className="text-sm text-muted-foreground">Edit any section before saving to your resume library.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Resume Title</label>
                <Input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Imported Resume" />
              </div>

              <div className="flex flex-wrap gap-1 border-b border-border pb-2">
                {IMPORT_SECTIONS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${activeSection === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {RESUME_SECTIONS.find((s) => s.id === id)?.label || id}
                  </button>
                ))}
              </div>

              <SectionEditor
                section={activeSection}
                content={content}
                onChange={(patch) => onContentChange({ ...content, ...patch })}
              />

              <Button type="button" className="w-full" onClick={onSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Imported Resume'}
              </Button>
            </CardContent>
          </Card>

          {parseResult?.rawTextPreview && (
            <Card>
              <CardHeader><CardTitle className="text-base">Extracted Text Preview</CardTitle></CardHeader>
              <CardContent>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  {parseResult.rawTextPreview}
                  {parseResult.rawTextLength > 2000 ? '\n…' : ''}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <Card>
            <CardHeader><CardTitle className="text-base">Live Preview</CardTitle></CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ResumePreview resume={previewResume} showActions={false} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
