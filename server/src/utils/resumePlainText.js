const formatDateRange = (start, end, isCurrent) => {
  if (!start && !end) return '';
  const endLabel = isCurrent ? 'Present' : end || '';
  return [start, endLabel].filter(Boolean).join(' – ');
};

export const resumeToPlainText = (resume) => {
  const c = resume?.content || {};
  const lines = [];

  const p = c.personalInfo || {};
  if (p.fullName) lines.push(p.fullName);
  if (p.headline) lines.push(p.headline);
  const contact = [p.email, p.phone, p.location, p.website].filter(Boolean);
  if (contact.length) lines.push(contact.join(' | '));
  lines.push('');

  if (c.summary?.text) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(c.summary.text);
    lines.push('');
  }

  if (c.experience?.length) {
    lines.push('EXPERIENCE');
    c.experience.forEach((exp) => {
      const header = [exp.title, exp.company].filter(Boolean).join(' — ');
      const dates = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
      lines.push([header, dates].filter(Boolean).join(' | '));
      if (exp.location) lines.push(exp.location);
      if (exp.description) lines.push(exp.description);
      lines.push('');
    });
  }

  if (c.education?.length) {
    lines.push('EDUCATION');
    c.education.forEach((edu) => {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
      lines.push(`${degree} — ${edu.institution || ''}`.trim());
      const dates = formatDateRange(edu.startDate, edu.endDate, edu.isCurrent);
      if (dates) lines.push(dates);
      if (edu.description) lines.push(edu.description);
      lines.push('');
    });
  }

  if (c.skills?.length) {
    lines.push('SKILLS');
    lines.push(c.skills.map((s) => s.name).filter(Boolean).join(', '));
    lines.push('');
  }

  if (c.projects?.length) {
    lines.push('PROJECTS');
    c.projects.forEach((proj) => {
      lines.push(proj.title || 'Project');
      if (proj.technologies?.length) lines.push(`Technologies: ${proj.technologies.join(', ')}`);
      if (proj.description) lines.push(proj.description);
      lines.push('');
    });
  }

  if (c.certificates?.length) {
    lines.push('CERTIFICATIONS');
    c.certificates.forEach((cert) => {
      lines.push([cert.name, cert.issuer].filter(Boolean).join(' — '));
    });
    lines.push('');
  }

  if (c.achievements?.length) {
    lines.push('ACHIEVEMENTS');
    c.achievements.forEach((a) => {
      lines.push([a.title, a.description].filter(Boolean).join(' — '));
    });
    lines.push('');
  }

  if (c.languages?.length) {
    lines.push('LANGUAGES');
    lines.push(c.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(', '));
    lines.push('');
  }

  return lines.join('\n').trim();
};
