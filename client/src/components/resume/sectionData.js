const fontSizeMap = { small: '13px', medium: '14px', large: '16px' };

export function formatDateRange(start, end, isCurrent) {
  if (!start && !end) return '';
  const endLabel = isCurrent ? 'Present' : end || '';
  return [start, endLabel].filter(Boolean).join(' – ');
}

export function buildSectionData({ content, sectionOrder, sectionVisibility }) {
  const sections = {};

  if (sectionVisibility.personalInfo !== false) {
    sections.personalInfo = { type: 'personalInfo', data: content.personalInfo || {} };
  }

  if (sectionVisibility.summary !== false && content.summary?.text) {
    sections.summary = { type: 'summary', data: content.summary };
  }

  if (sectionVisibility.experience !== false && content.experience?.length) {
    sections.experience = { type: 'experience', data: content.experience };
  }

  if (sectionVisibility.education !== false && content.education?.length) {
    sections.education = { type: 'education', data: content.education };
  }

  if (sectionVisibility.skills !== false && content.skills?.length) {
    sections.skills = { type: 'skills', data: content.skills };
  }

  if (sectionVisibility.projects !== false && content.projects?.length) {
    sections.projects = { type: 'projects', data: content.projects };
  }

  if (sectionVisibility.certificates !== false && content.certificates?.length) {
    sections.certificates = { type: 'certificates', data: content.certificates };
  }

  if (sectionVisibility.achievements !== false && content.achievements?.length) {
    sections.achievements = { type: 'achievements', data: content.achievements };
  }

  if (sectionVisibility.languages !== false && content.languages?.length) {
    sections.languages = { type: 'languages', data: content.languages };
  }

  if (sectionVisibility.interests !== false && content.interests?.length) {
    sections.interests = { type: 'interests', data: content.interests };
  }

  if (sectionVisibility.socialLinks !== false) {
    const links = content.socialLinks || {};
    const entries = Object.entries(links).filter(([, v]) => v);
    if (entries.length) {
      sections.socialLinks = { type: 'socialLinks', data: entries };
    }
  }

  const orderedIds = (sectionOrder || Object.keys(sections))
    .filter((id) => sections[id]);

  return { sections, orderedIds };
}

export function getResumeStyles(settings = {}) {
  const color = settings.primaryColor || '#2563eb';
  const accent = settings.accentColor || '#1e40af';
  const fontFamily = settings.fontFamily || 'Inter';
  const fontSize = fontSizeMap[settings.fontSize] || fontSizeMap.medium;

  return {
    color,
    accent,
    fontFamily,
    fontSize,
    baseStyle: {
      fontFamily,
      fontSize,
      lineHeight: 1.55,
      color: '#1a1a1a',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
    },
  };
}
