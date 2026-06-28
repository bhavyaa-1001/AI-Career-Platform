export const TEMPLATE_IDS = ['modern', 'corporate', 'minimal', 'developer', 'creative'];

/** @deprecated legacy ids mapped at runtime */
export const LEGACY_TEMPLATE_MAP = {
  classic: 'corporate',
  professional: 'corporate',
};

export const PAGE_LAYOUTS = [
  { id: 'single', label: 'Single Column' },
  { id: 'two-column', label: 'Two Column' },
  { id: 'sidebar-left', label: 'Sidebar Left' },
  { id: 'sidebar-right', label: 'Sidebar Right' },
];

export const TEMPLATE_REGISTRY = {
  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Clean layout with accent sidebar and underline headings',
    layout: 'sidebar-right',
    headingStyle: 'underline',
    defaultSettings: {
      fontFamily: 'Inter',
      primaryColor: '#2563eb',
      accentColor: '#1e40af',
      fontSize: 'medium',
      pageLayout: 'sidebar-right',
    },
    sidebarSections: ['skills', 'languages', 'certificates', 'socialLinks', 'interests'],
    previewGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  },
  corporate: {
    id: 'corporate',
    label: 'Corporate',
    description: 'Traditional executive format with bold uppercase sections',
    layout: 'single',
    headingStyle: 'bold',
    defaultSettings: {
      fontFamily: 'Georgia',
      primaryColor: '#1e293b',
      accentColor: '#475569',
      fontSize: 'medium',
      pageLayout: 'single',
    },
    sidebarSections: [],
    previewGradient: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    description: 'Maximum whitespace, ATS-optimized single column',
    layout: 'single',
    headingStyle: 'minimal',
    defaultSettings: {
      fontFamily: 'Helvetica',
      primaryColor: '#171717',
      accentColor: '#525252',
      fontSize: 'medium',
      pageLayout: 'single',
    },
    sidebarSections: [],
    previewGradient: 'linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)',
  },
  developer: {
    id: 'developer',
    label: 'Developer',
    description: 'Tech-focused two-column layout with monospace accents',
    layout: 'two-column',
    headingStyle: 'developer',
    defaultSettings: {
      fontFamily: 'Roboto',
      primaryColor: '#0f766e',
      accentColor: '#115e59',
      fontSize: 'medium',
      pageLayout: 'two-column',
    },
    sidebarSections: ['skills', 'languages', 'socialLinks', 'certificates'],
    previewGradient: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
  },
  creative: {
    id: 'creative',
    label: 'Creative',
    description: 'Bold accent header with expressive section styling',
    layout: 'accent-header',
    headingStyle: 'creative',
    defaultSettings: {
      fontFamily: 'Merriweather',
      primaryColor: '#7c3aed',
      accentColor: '#5b21b6',
      fontSize: 'medium',
      pageLayout: 'single',
    },
    sidebarSections: ['skills', 'interests', 'socialLinks'],
    previewGradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  },
};

export const TEMPLATES = TEMPLATE_IDS.map((id) => TEMPLATE_REGISTRY[id]);

export function resolveTemplateId(templateId) {
  if (TEMPLATE_REGISTRY[templateId]) return templateId;
  return LEGACY_TEMPLATE_MAP[templateId] || 'modern';
}

export function getTemplateConfig(templateId) {
  return TEMPLATE_REGISTRY[resolveTemplateId(templateId)] || TEMPLATE_REGISTRY.modern;
}

export function getTemplateDefaults(templateId) {
  const config = getTemplateConfig(templateId);
  return {
    template: config.id,
    settings: { ...config.defaultSettings },
  };
}

export function mergeTemplateSettings(templateId, currentSettings = {}) {
  const defaults = getTemplateConfig(templateId).defaultSettings;
  return {
    fontFamily: currentSettings.fontFamily || defaults.fontFamily,
    primaryColor: currentSettings.primaryColor || defaults.primaryColor,
    accentColor: currentSettings.accentColor || defaults.accentColor,
    fontSize: currentSettings.fontSize || defaults.fontSize,
    pageLayout: currentSettings.pageLayout || defaults.pageLayout,
  };
}
