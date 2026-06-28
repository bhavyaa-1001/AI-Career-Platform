import { TemplateRenderer } from './TemplateRenderer';

export function ResumeDocument({ resume, className = '' }) {
  if (!resume) return null;
  return <TemplateRenderer resume={resume} className={className} />;
}
