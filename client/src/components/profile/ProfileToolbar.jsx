import { Link } from 'react-router-dom';

import { Badge, Button } from '@/components/ui';

export function ProfileToolbar({ profile, onSaveDraft, onPublish, onDiscard, loading }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Profile editor</span>
        {profile?.hasDraft && <Badge variant="warning">Unpublished draft</Badge>}
        {profile?.isPublished && !profile?.hasDraft && <Badge variant="success">Published</Badge>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onSaveDraft} disabled={loading}>
          Save draft
        </Button>
        <Link to="/profile/preview">
          <Button variant="outline" size="sm">Preview</Button>
        </Link>
        {profile?.hasDraft && (
          <>
            <Button size="sm" onClick={onPublish} disabled={loading}>Publish</Button>
            <Button variant="ghost" size="sm" onClick={onDiscard} disabled={loading}>Discard draft</Button>
          </>
        )}
      </div>
    </div>
  );
}
