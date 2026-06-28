import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { DownloadPdfButton } from '@/components/resume/DownloadPdfButton';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
import { TEMPLATES } from '@/features/resume/constants';
import { resolveTemplateId } from '@/features/resume/templateRegistry';
import { useResumes, useResumeMutations } from '@/hooks/useResume';

export function ResumeDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useResumes();
  const { create, remove, duplicate, importFromProfile } = useResumeMutations();
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const resumes = data?.data?.resumes || [];

  const handleCreate = async () => {
    const res = await create.mutateAsync({ title: newTitle || undefined });
    setShowCreate(false);
    setNewTitle('');
    navigate(`/resumes/${res.data.resume.id}`);
  };

  const handleImport = async () => {
    const res = await importFromProfile.mutateAsync('Imported from Profile');
    navigate(`/resumes/${res.data.resume.id}`);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await remove.mutateAsync(id);
  };

  const handleDuplicate = async (id) => {
    const res = await duplicate.mutateAsync(id);
    navigate(`/resumes/${res.data.resume.id}`);
  };

  const templateLabel = (id) => TEMPLATES.find((t) => t.id === resolveTemplateId(id))?.label || id;

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
          <p className="mt-1 text-muted-foreground">Create ATS-friendly resumes with live preview and version history.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/resumes/import">
            <Button type="button" variant="outline">Import PDF/DOCX</Button>
          </Link>
          <Button type="button" variant="outline" onClick={handleImport} disabled={importFromProfile.isPending}>
            Import from Profile
          </Button>
          <Button type="button" onClick={() => setShowCreate(true)}>+ New Resume</Button>
        </div>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 pt-6">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Resume Title</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Software Engineer Resume" />
            </div>
            <Button type="button" onClick={handleCreate} disabled={create.isPending}>Create</Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {resumes.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <p className="text-muted-foreground">No resumes yet. Create one or import from your profile.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button type="button" onClick={() => setShowCreate(true)}>Create Resume</Button>
              <Button type="button" variant="outline" onClick={handleImport}>Import from Profile</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <Card key={r.id} className="group transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  {r.isDefault && <Badge variant="outline">Default</Badge>}
                  {r.imported && <Badge variant="success">Imported</Badge>}
                </div>
                <CardDescription>{templateLabel(r.template)} · Updated {new Date(r.updatedAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link to={`/resumes/${r.id}`}>
                  <Button type="button" size="sm">Edit</Button>
                </Link>
                <Button type="button" size="sm" variant="outline" onClick={() => handleDuplicate(r.id)}>Duplicate</Button>
                <DownloadPdfButton resumeId={r.id} variant="outline" size="sm" />
                <Button type="button" size="sm" variant="ghost" onClick={() => handleDelete(r.id, r.title)}>Delete</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
