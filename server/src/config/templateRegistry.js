export const LEGACY_TEMPLATE_MAP = { classic: 'corporate', professional: 'corporate' };

export const TEMPLATE_REGISTRY = {
  modern: {
    id: 'modern',
    headingStyle: 'underline',
    sidebarSections: ['skills', 'languages', 'certificates', 'socialLinks', 'interests'],
    defaultSettings: { pageLayout: 'sidebar-right' },
  },
  corporate: {
    id: 'corporate',
    headingStyle: 'bold',
    sidebarSections: [],
    defaultSettings: { pageLayout: 'single' },
  },
  minimal: {
    id: 'minimal',
    headingStyle: 'minimal',
    sidebarSections: [],
    defaultSettings: { pageLayout: 'single' },
  },
  developer: {
    id: 'developer',
    headingStyle: 'developer',
    sidebarSections: ['skills', 'languages', 'socialLinks', 'certificates'],
    defaultSettings: { pageLayout: 'two-column' },
  },
  creative: {
    id: 'creative',
    headingStyle: 'creative',
    sidebarSections: ['skills', 'interests', 'socialLinks'],
    defaultSettings: { pageLayout: 'single' },
  },
};

export const resolveTemplateId = (templateId) =>
  TEMPLATE_REGISTRY[templateId] ? templateId : LEGACY_TEMPLATE_MAP[templateId] || 'modern';

export const getTemplateConfig = (templateId) =>
  TEMPLATE_REGISTRY[resolveTemplateId(templateId)] || TEMPLATE_REGISTRY.modern;
