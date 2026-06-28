import { getTemplateConfig, resolveTemplateId } from '@/features/resume/templateRegistry';

import { buildSectionData, getResumeStyles } from './sectionData';
import {
  CorporateTemplate,
  CreativeTemplate,
  DeveloperTemplate,
  MinimalTemplate,
  ModernTemplate,
} from './templates/layouts';

const TEMPLATE_COMPONENTS = {
  modern: ModernTemplate,
  corporate: CorporateTemplate,
  minimal: MinimalTemplate,
  developer: DeveloperTemplate,
  creative: CreativeTemplate,
};

export function TemplateRenderer({ resume, className = '' }) {
  const templateId = resolveTemplateId(resume.template);
  const config = getTemplateConfig(templateId);
  const sectionData = buildSectionData(resume);
  const styles = getResumeStyles(resume.settings);
  const Component = TEMPLATE_COMPONENTS[templateId] || ModernTemplate;

  return (
    <div className={`resume-document ${className}`} data-template={templateId}>
      <Component resume={resume} sectionData={sectionData} styles={styles} config={config} />
    </div>
  );
}
