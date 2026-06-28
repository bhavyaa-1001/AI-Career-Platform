import { useRef, useState } from 'react';

import { Button, Input } from '@/components/ui';
import { useTrackingMutations } from '@/hooks/useApplicationTracking';

export function AttachmentsPanel({ applicationId, attachments = [] }) {
  const fileRef = useRef(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const { addAttachmentUrl, uploadAttachment, deleteAttachment } = useTrackingMutations();

  const handleUrlAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    await addAttachmentUrl.mutateAsync({ id: applicationId, name: name.trim(), url: url.trim() });
    setName('');
    setUrl('');
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAttachment.mutateAsync({ id: applicationId, file });
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleUrlAdd} className="space-y-2 rounded-lg border border-border p-3">
        <p className="text-sm font-medium">Add link</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Label (e.g. Portfolio)" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" type="url" />
        <Button type="submit" size="sm" disabled={addAttachmentUrl.isPending}>Add link</Button>
      </form>

      <div>
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,image/*" onChange={handleFile} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploadAttachment.isPending}
        >
          {uploadAttachment.isPending ? 'Uploading…' : 'Upload file'}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or images · max 10MB</p>
      </div>

      {attachments.length ? (
        <ul className="divide-y divide-border">
          {attachments.map((att) => (
            <li key={att.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium text-primary hover:underline"
                >
                  {att.name}
                </a>
                <p className="text-xs text-muted-foreground">
                  {new Date(att.createdAt).toLocaleDateString()}
                  {att.fileType ? ` · ${att.fileType}` : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteAttachment.mutateAsync({ id: applicationId, attachmentId: att.id })}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No attachments yet.</p>
      )}
    </div>
  );
}
