import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ImportPreviewEditor } from '@/components/resume/ImportPreviewEditor';
import { ResumeUploadZone } from '@/components/resume/ResumeUploadZone';
import { Button } from '@/components/ui';
import { EMPTY_RESUME_CONTENT } from '@/features/resume/constants';
import { useResumeMutations } from '@/hooks/useResume';

export function ResumeImportPage() {
  const navigate = useNavigate();
  const { parseImport, saveImport } = useResumeMutations();

  const [parseResult, setParseResult] = useState(null);
  const [importMeta, setImportMeta] = useState(null);
  const [content, setContent] = useState(EMPTY_RESUME_CONTENT);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setError(null);
    try {
      const res = await parseImport.mutateAsync(file);
      const data = res.data;
      setParseResult(data);
      setImportMeta(data.importMeta);
      setContent(data.content);
      setTitle(data.importMeta?.sourceFileName?.replace(/\.[^.]+$/, '') || 'Imported Resume');
    } catch (err) {
      setError(err.message);
      setParseResult(null);
    }
  };

  const handleSave = async () => {
    setError(null);
    try {
      const res = await saveImport.mutateAsync({
        title,
        template: 'modern',
        content,
        importMeta,
      });
      navigate(`/resumes/${res.data.resume.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setParseResult(null);
    setImportMeta(null);
    setContent(EMPTY_RESUME_CONTENT);
    setTitle('');
    setError(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/resumes" className="text-sm text-muted-foreground hover:text-foreground">← Back to Resumes</Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Import Resume</h1>
          <p className="mt-1 text-muted-foreground">
            Upload a PDF or DOCX file. We extract text, map fields, and let you edit before saving.
          </p>
        </div>
        {parseResult && (
          <Button type="button" variant="outline" onClick={handleReset}>
            Upload Another
          </Button>
        )}
      </div>

      {!parseResult ? (
        <ResumeUploadZone onUpload={handleUpload} loading={parseImport.isPending} error={error} />
      ) : (
        <ImportPreviewEditor
          parseResult={parseResult}
          content={content}
          onContentChange={setContent}
          title={title}
          onTitleChange={setTitle}
          onSave={handleSave}
          saving={saveImport.isPending}
        />
      )}

      {parseResult && error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
