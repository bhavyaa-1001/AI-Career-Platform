export const TEMPLATE_DEFINITIONS = [
  {
    id: 'modern',
    label: 'Modern',
    layout: 'sidebar-right',
    defaultSettings: { fontFamily: 'Inter', primaryColor: '#2563eb', accentColor: '#1e40af', fontSize: 'medium', pageLayout: 'sidebar-right' },
  },
  {
    id: 'corporate',
    label: 'Corporate',
    layout: 'single',
    defaultSettings: { fontFamily: 'Georgia', primaryColor: '#1e293b', accentColor: '#475569', fontSize: 'medium', pageLayout: 'single' },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    layout: 'single',
    defaultSettings: { fontFamily: 'Helvetica', primaryColor: '#171717', accentColor: '#525252', fontSize: 'medium', pageLayout: 'single' },
  },
  {
    id: 'developer',
    label: 'Developer',
    layout: 'two-column',
    defaultSettings: { fontFamily: 'Roboto', primaryColor: '#0f766e', accentColor: '#115e59', fontSize: 'medium', pageLayout: 'two-column' },
  },
  {
    id: 'creative',
    label: 'Creative',
    layout: 'accent-header',
    defaultSettings: { fontFamily: 'Merriweather', primaryColor: '#7c3aed', accentColor: '#5b21b6', fontSize: 'medium', pageLayout: 'single' },
  },
];

export const getTemplateDefinitions = () => TEMPLATE_DEFINITIONS;
