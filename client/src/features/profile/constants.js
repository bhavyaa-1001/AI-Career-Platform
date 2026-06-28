export const PROFICIENCY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export const LANGUAGE_PROFICIENCY_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
];

export const formatMonth = (value) => {
  if (!value) return 'Present';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const emptyEducation = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  grade: '',
  description: '',
};

export const emptyExperience = {
  company: '',
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
};

export const emptyProject = {
  title: '',
  description: '',
  url: '',
  technologies: '',
  startDate: '',
  endDate: '',
};

export const emptyCertification = {
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  url: '',
};

export const emptyLanguage = { name: '', proficiency: 'conversational' };

export const emptyCareerPreferences = {
  preferredRoles: '',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  period: 'annual',
};
