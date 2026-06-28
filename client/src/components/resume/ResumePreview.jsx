import { useRef } from 'react';

import { Button } from '@/components/ui';
import { getTemplateConfig } from '@/features/resume/templateRegistry';

import { DownloadPdfButton } from './DownloadPdfButton';
import { ResumeDocument } from './ResumeDocument';

export function ResumePreview({ resume, className = '', showActions = true, printRef, resumeId, useLiveState = false }) {
  const internalRef = useRef(null);
  const ref = printRef || internalRef;

  if (!resume) return null;

  const config = getTemplateConfig(resume.template);
  const pdfOverride = useLiveState
    ? {
        title: resume.title,
        template: resume.template,
        settings: resume.settings,
        sectionOrder: resume.sectionOrder,
        sectionVisibility: resume.sectionVisibility,
        content: resume.content,
      }
    : null;

  const handlePrint = () => {
    const el = ref.current;
    if (!el) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.title || 'Resume'}</title>
          <style>
            @page { size: letter; margin: 0.45in; }
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; background: #fff; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .resume-page { width: 100%; max-width: 8.5in; margin: 0 auto; background: #fff; }
            .resume-section, .resume-entry { page-break-inside: avoid; break-inside: avoid-page; }
            h1, h2 { page-break-after: avoid; break-after: avoid-page; }
            .resume-template { min-height: auto !important; }
            .resume-sidebar, .resume-creative-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>
          <div class="resume-page">${el.innerHTML}</div>
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={className}>
      {showActions && (
        <div className="resume-preview-chrome mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {config.label} template · {resume.settings?.pageLayout || config.layout}
          </span>
          <div className="flex flex-wrap gap-2">
            {resumeId && (
              <DownloadPdfButton
                resumeId={resumeId}
                resumeOverride={pdfOverride}
                variant="default"
                size="sm"
              />
            )}
            <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
              Print
            </Button>
          </div>
        </div>
      )}
      <div className="resume-preview-frame overflow-hidden rounded-lg border border-border bg-white shadow-lg">
        <div
          ref={ref}
          className="resume-page mx-auto w-full max-w-[680px] overflow-y-auto bg-white text-black"
          style={{ minHeight: 600, aspectRatio: '8.5 / 11' }}
        >
          <ResumeDocument resume={resume} />
        </div>
      </div>
    </div>
  );
}
