import { Button } from '@/components/ui';
import { useResumeVersions, useResumeMutations } from '@/hooks/useResume';

export function VersionHistoryPanel({ resumeId }) {
  const { data, isLoading } = useResumeVersions(resumeId);
  const { restoreVersion } = useResumeMutations();
  const versions = data?.data?.versions || [];

  const handleRestore = async (versionId) => {
    if (!window.confirm('Restore this version? Current changes will be saved as a new version.')) return;
    await restoreVersion.mutateAsync({ id: resumeId, versionId });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading versions...</p>;

  if (!versions.length) {
    return <p className="text-sm text-muted-foreground">No version history yet.</p>;
  }

  return (
    <div className="max-h-64 space-y-2 overflow-y-auto">
      {versions.map((v) => (
        <div key={v.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
          <div>
            <div className="font-medium">v{v.versionNumber} — {v.label}</div>
            <div className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={restoreVersion.isPending}
            onClick={() => handleRestore(v.id)}
          >
            Restore
          </Button>
        </div>
      ))}
    </div>
  );
}
