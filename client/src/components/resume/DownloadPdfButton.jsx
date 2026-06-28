import { useState } from 'react';

import { Button } from '@/components/ui';
import { downloadResumePdf, triggerPdfDownload } from '@/lib/api/resumePdf';

export function DownloadPdfButton({ resumeId, resumeOverride, variant = 'default', size = 'sm', className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!resumeId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await downloadResumePdf(resumeId, resumeOverride);
      triggerPdfDownload(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button type="button" variant={variant} size={size} onClick={handleDownload} disabled={loading || !resumeId}>
        {loading ? 'Generating…' : 'Download PDF'}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
