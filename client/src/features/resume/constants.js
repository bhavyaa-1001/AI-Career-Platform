export const RESUME_SECTIONS = [
  { id: 'personalInfo', label: 'Personal Info', icon: '👤' },
  { id: 'summary', label: 'Summary', icon: '📝' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certificates', label: 'Certificates', icon: '📜' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'languages', label: 'Languages', icon: '🌐' },
  { id: 'interests', label: 'Interests', icon: '❤️' },
  { id: 'socialLinks', label: 'Social Links', icon: '🔗' },
];

export const SECTION_IDS = RESUME_SECTIONS.map((s) => s.id);

export { TEMPLATES, TEMPLATE_IDS, PAGE_LAYOUTS, getTemplateDefaults, resolveTemplateId } from './templateRegistry';

export const FONTS = ['Inter', 'Georgia', 'Helvetica', 'Times New Roman', 'Roboto', 'Merriweather'];

export const FONT_SIZES = [
  { id: 'small', label: 'Small', scale: 0.9 },
  { id: 'medium', label: 'Medium', scale: 1 },
  { id: 'large', label: 'Large', scale: 1.1 },
];

export const COLOR_PRESETS = [
  { id: 'blue', primary: '#2563eb', accent: '#1e40af' },
  { id: 'indigo', primary: '#6366f1', accent: '#4338ca' },
  { id: 'emerald', primary: '#059669', accent: '#047857' },
  { id: 'rose', primary: '#e11d48', accent: '#be123c' },
  { id: 'slate', primary: '#475569', accent: '#334155' },
  { id: 'amber', primary: '#d97706', accent: '#b45309' },
];

export const EMPTY_RESUME_CONTENT = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', headline: '', website: '' },
  summary: { text: '' },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certificates: [],
  achievements: [],
  languages: [],
  interests: [],
  socialLinks: { github: '', linkedin: '', portfolio: '', twitter: '' },
};

export const DEFAULT_SECTION_ORDER = SECTION_IDS;

export const DEFAULT_SECTION_VISIBILITY = Object.fromEntries(SECTION_IDS.map((id) => [id, true]));

export const emptyEducation = () => ({
  institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, grade: '', description: '',
});

export const emptyExperience = () => ({
  company: '', title: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '',
});

export const emptyProject = () => ({
  title: '', description: '', url: '', technologies: [], startDate: '', endDate: '',
});

export const emptySkill = () => ({ name: '', proficiency: 'Intermediate' });

export const emptyCertificate = () => ({
  name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', url: '',
});

export const emptyAchievement = () => ({ title: '', description: '', date: '' });

export const emptyLanguage = () => ({ name: '', proficiency: 'Conversational' });

export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
export const LANGUAGE_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'];
