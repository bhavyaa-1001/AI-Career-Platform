import { getTemplateConfig, resolveTemplateId } from '../config/templateRegistry.js';

import { buildSectionData, formatDateRange, getResumeStyles } from './resumeSectionData.js';

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const headingHtml = (title, color, accent, style, light = false) => {
  const styles = {
    underline: `border-bottom:2px solid ${color};padding-bottom:4px;margin:0 0 12px;font-size:1em;font-weight:700`,
    bold: `font-weight:700;color:${color};margin:0 0 12px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.82em`,
    minimal: `font-weight:600;color:${color};margin:0 0 8px;font-size:0.92em`,
    developer: `font-weight:700;color:${color};margin:0 0 10px;font-size:0.78em;text-transform:uppercase;letter-spacing:0.1em;font-family:Consolas,Monaco,monospace;border-left:3px solid ${color};padding-left:8px`,
    creative: `font-weight:700;color:#fff;background:${color};display:inline-block;padding:4px 12px;margin:0 0 12px;font-size:0.85em;border-radius:2px;box-shadow:3px 3px 0 ${accent}`,
  };
  const lightStyles = {
    underline: `border-bottom:2px solid #fff;padding-bottom:4px;margin:0 0 12px;font-size:1em;font-weight:700;color:#fff`,
    bold: `font-weight:700;color:#fff;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.06em;font-size:0.82em`,
    minimal: `font-weight:600;color:#fff;margin:0 0 8px;font-size:0.92em`,
    developer: `font-weight:700;color:#fff;margin:0 0 10px;font-size:0.78em;text-transform:uppercase;letter-spacing:0.1em;font-family:Consolas,Monaco,monospace;border-left:3px solid #fff;padding-left:8px`,
  };
  const s = style === 'creative' ? styles.creative : (light ? lightStyles[style] || lightStyles.underline : styles[style] || styles.underline);
  return `<h2 style="${s}">${esc(title)}</h2>`;
};

const renderPersonalInfo = (data, color, variant, light = false) => {
  const p = data || {};
  const contact = [p.email, p.phone, p.location, p.website].filter(Boolean);
  const contactHtml = contact.map(esc).join(' · ');

  if (variant === 'corporate') {
    return `<header style="text-align:center;margin-bottom:24px;border-bottom:2px solid ${color};padding-bottom:16px">
      <h1 style="font-size:1.85em;font-weight:700;margin:0;color:${color}">${esc(p.fullName || 'Your Name')}</h1>
      ${p.headline ? `<p style="margin:8px 0 0;color:#444">${esc(p.headline)}</p>` : ''}
      ${contactHtml ? `<p style="margin:10px 0 0;font-size:0.88em;color:#666">${contactHtml}</p>` : ''}
    </header>`;
  }
  if (variant === 'creative') {
    return `<header>
      <h1 style="font-size:2em;font-weight:800;margin:0;color:#fff">${esc(p.fullName || 'Your Name')}</h1>
      ${p.headline ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.9)">${esc(p.headline)}</p>` : ''}
      ${contactHtml ? `<p style="margin:10px 0 0;font-size:0.88em;color:rgba(255,255,255,0.85)">${contactHtml}</p>` : ''}
    </header>`;
  }
  if (variant === 'developer') {
    return `<header style="margin-bottom:20px;border-bottom:1px dashed ${color};padding-bottom:14px">
      <h1 style="font-size:1.7em;font-weight:700;margin:0;color:${color};font-family:Consolas,Monaco,monospace">&lt;${esc(p.fullName || 'Your Name')} /&gt;</h1>
      ${p.headline ? `<p style="margin:6px 0 0;color:#555">${esc(p.headline)}</p>` : ''}
      ${contactHtml ? `<p style="margin:8px 0 0;font-size:0.85em;color:#666;font-family:Consolas,Monaco,monospace">${contactHtml}</p>` : ''}
    </header>`;
  }
  if (variant === 'minimal') {
    return `<header style="margin-bottom:28px">
      <h1 style="font-size:1.6em;font-weight:600;margin:0;color:#111">${esc(p.fullName || 'Your Name')}</h1>
      ${p.headline ? `<p style="margin:6px 0 0;color:#666">${esc(p.headline)}</p>` : ''}
      ${contactHtml ? `<p style="margin:8px 0 0;font-size:0.85em;color:#888">${contactHtml}</p>` : ''}
    </header>`;
  }

  const textColor = light ? '#fff' : color;
  const subColor = light ? 'rgba(255,255,255,0.85)' : '#666';
  return `<header style="margin-bottom:20px">
    <h1 style="font-size:1.75em;font-weight:700;margin:0;color:${textColor}">${esc(p.fullName || 'Your Name')}</h1>
    ${p.headline ? `<p style="margin:6px 0 0;color:${light ? 'rgba(255,255,255,0.9)' : '#555'}">${esc(p.headline)}</p>` : ''}
    ${contactHtml ? `<p style="margin:8px 0 0;font-size:0.9em;color:${subColor}">${contactHtml}</p>` : ''}
  </header>`;
};

const renderSection = (section, { color, accent, headingStyle, variant, light }) => {
  if (!section) return '';
  const hs = headingStyle;
  const hColor = light && headingStyle !== 'creative' ? '#fff' : color;

  switch (section.type) {
    case 'personalInfo':
      return renderPersonalInfo(section.data, color, variant, light);
    case 'summary':
      return `<section class="resume-section"><h2 style="display:none">Professional Summary</h2>${headingHtml('Professional Summary', hColor, accent, hs, light)}<p style="margin:0;white-space:pre-wrap">${esc(section.data.text)}</p></section>`;
    case 'experience':
      return `<section class="resume-section"><h2 style="display:none">Experience</h2>${headingHtml('Experience', hColor, accent, hs, light)}${section.data.map((exp) => `<article class="resume-entry"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><strong>${esc(exp.title)}${exp.company ? ` — ${esc(exp.company)}` : ''}</strong><span style="color:#666;font-size:0.9em">${esc(formatDateRange(exp.startDate, exp.endDate, exp.isCurrent))}</span></div>${exp.location ? `<div style="color:#666;font-size:0.85em">${esc(exp.location)}</div>` : ''}${exp.description ? `<p style="margin:4px 0 0;white-space:pre-wrap">${esc(exp.description)}</p>` : ''}</article>`).join('')}</section>`;
    case 'education':
      return `<section class="resume-section"><h2 style="display:none">Education</h2>${headingHtml('Education', hColor, accent, hs, light)}${section.data.map((edu) => `<article class="resume-entry"><strong>${esc(edu.degree)}${edu.fieldOfStudy ? ` in ${esc(edu.fieldOfStudy)}` : ''}</strong><div style="color:#666;font-size:0.9em">${esc(edu.institution)}${edu.grade ? ` · ${esc(edu.grade)}` : ''} · ${esc(formatDateRange(edu.startDate, edu.endDate, edu.isCurrent))}</div>${edu.description ? `<p style="margin:4px 0 0;font-size:0.9em">${esc(edu.description)}</p>` : ''}</article>`).join('')}</section>`;
    case 'skills':
      if (variant === 'developer') {
        return `<section class="resume-section"><h2 style="display:none">Skills</h2>${headingHtml('Skills', hColor, accent, hs, light)}<div style="display:flex;flex-wrap:wrap;gap:6px">${section.data.map((s) => `<span style="background:${color}15;color:${color};padding:3px 8px;border-radius:4px;font-size:0.85em;font-family:Consolas,Monaco,monospace">${esc(s.name)}</span>`).join('')}</div></section>`;
      }
      return `<section class="resume-section"><h2 style="display:none">Skills</h2>${headingHtml('Skills', hColor, accent, hs, light)}<p style="margin:0">${section.data.map((s) => esc(`${s.name}${s.proficiency ? ` (${s.proficiency})` : ''}`)).join(' · ')}</p></section>`;
    case 'projects':
      return `<section class="resume-section"><h2 style="display:none">Projects</h2>${headingHtml('Projects', hColor, accent, hs, light)}${section.data.map((proj) => `<article class="resume-entry"><strong${variant === 'developer' ? ' style="font-family:Consolas,Monaco,monospace"' : ''}>${esc(proj.title)}</strong>${proj.url ? `<span style="color:${color};font-size:0.85em"> — ${esc(proj.url)}</span>` : ''}${proj.technologies?.length ? `<div style="font-size:0.85em;color:#666">[${proj.technologies.map(esc).join(' · ')}]</div>` : ''}${proj.description ? `<p style="margin:4px 0 0">${esc(proj.description)}</p>` : ''}</article>`).join('')}</section>`;
    case 'certificates':
      return `<section class="resume-section"><h2 style="display:none">Certificates</h2>${headingHtml('Certificates', hColor, accent, hs, light)}${section.data.map((c) => `<div class="resume-entry"><strong>${esc(c.name)}</strong>${c.issuer ? `<span style="color:#666"> — ${esc(c.issuer)}</span>` : ''}${c.issueDate ? `<span style="color:#666;font-size:0.85em"> (${esc(c.issueDate)})</span>` : ''}</div>`).join('')}</section>`;
    case 'achievements':
      return `<section class="resume-section"><h2 style="display:none">Achievements</h2>${headingHtml('Achievements', hColor, accent, hs, light)}<ul style="margin:0;padding-left:20px">${section.data.map((a) => `<li><strong>${esc(a.title)}</strong>${a.date ? ` <span style="color:#666">(${esc(a.date)})</span>` : ''}${a.description ? ` — ${esc(a.description)}` : ''}</li>`).join('')}</ul></section>`;
    case 'languages':
      return `<section class="resume-section"><h2 style="display:none">Languages</h2>${headingHtml('Languages', hColor, accent, hs, light)}<p style="margin:0">${section.data.map((l) => esc(`${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`)).join(' · ')}</p></section>`;
    case 'interests':
      return `<section class="resume-section"><h2 style="display:none">Interests</h2>${headingHtml('Interests', hColor, accent, hs, light)}<p style="margin:0">${section.data.map(esc).join(' · ')}</p></section>`;
    case 'socialLinks':
      return `<section class="resume-section"><h2 style="display:none">Links</h2>${headingHtml('Links', hColor, accent, hs, light)}<p style="margin:0${light ? ';color:rgba(255,255,255,0.9)' : ''}">${section.data.map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ')}</p></section>`;
    default:
      return '';
  }
};

const renderSections = (ids, sections, opts) => ids.map((id) => renderSection(sections[id], opts)).join('');

const splitSections = (orderedIds, sidebarIds) => ({
  main: orderedIds.filter((id) => !sidebarIds.includes(id)),
  sidebar: orderedIds.filter((id) => sidebarIds.includes(id)),
});

const PDF_STYLES = `
  @page { size: letter; margin: 0.45in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .resume-section { page-break-inside: avoid; break-inside: avoid-page; margin-bottom: 16px; }
  .resume-entry { page-break-inside: avoid; break-inside: avoid-page; margin-bottom: 10px; }
  h1, h2 { page-break-after: avoid; break-after: avoid-page; }
  p, li { orphans: 3; widows: 3; }
  .resume-template--modern { display: flex; min-height: 100%; }
  .resume-main { flex: 1; padding: 32px 28px; }
  .resume-sidebar { width: 34%; padding: 32px 20px; font-size: 0.92em; color: #fff; }
  .resume-grid { display: grid; grid-template-columns: 1fr 280px; gap: 28px; }
  .resume-creative-header { margin-bottom: 24px; padding: 32px 36px; }
  .resume-body { padding: 0 36px 36px; }
`;

const renderTemplateBody = (resume, sectionData, styles, config) => {
  const templateId = resolveTemplateId(resume.template);
  const { sections, orderedIds } = sectionData;
  const { color, accent, fontFamily, fontSize } = styles;
  const layout = resume.settings?.pageLayout || config.defaultSettings.pageLayout;
  const opts = { color, accent, headingStyle: config.headingStyle, variant: templateId, light: false };
  const baseStyle = `font-family:${fontFamily},Helvetica,Arial,sans-serif;font-size:${fontSize};line-height:1.55;color:#1a1a1a`;

  if (templateId === 'modern') {
    const useSidebar = layout !== 'single';
    const { main, sidebar } = splitSections(orderedIds, useSidebar ? config.sidebarSections : []);
    const flexDir = layout === 'sidebar-left' ? 'row-reverse' : 'row';
    return `<article class="resume-template resume-template--modern" style="${baseStyle};display:flex;flex-direction:${flexDir}">
      <div class="resume-main">${renderSections(main, sections, opts)}</div>
      ${sidebar.length ? `<aside class="resume-sidebar" style="background:${color}">${renderSections(sidebar, sections, { ...opts, light: true })}</aside>` : ''}
    </article>`;
  }

  if (templateId === 'corporate') {
    return `<article class="resume-template resume-template--corporate" style="${baseStyle};padding:36px 40px">${renderSections(orderedIds, sections, { ...opts, variant: 'corporate' })}</article>`;
  }

  if (templateId === 'minimal') {
    return `<article class="resume-template resume-template--minimal" style="${baseStyle};padding:48px 56px">${renderSections(orderedIds, sections, { ...opts, variant: 'minimal' })}</article>`;
  }

  if (templateId === 'developer') {
    const personal = orderedIds.filter((id) => id === 'personalInfo');
    const rest = orderedIds.filter((id) => id !== 'personalInfo');
    const devOpts = { ...opts, variant: 'developer' };
    if (layout === 'single') {
      return `<article class="resume-template resume-template--developer" style="${baseStyle};padding:28px 32px">${renderSections(orderedIds, sections, devOpts)}</article>`;
    }
    const { main, sidebar } = splitSections(rest, config.sidebarSections);
    return `<article class="resume-template resume-template--developer" style="${baseStyle};padding:28px 32px">
      ${renderSections(personal, sections, devOpts)}
      <div class="resume-grid"><div>${renderSections(main, sections, devOpts)}</div><aside>${renderSections(sidebar, sections, devOpts)}</aside></div>
    </article>`;
  }

  if (templateId === 'creative') {
    const header = orderedIds.filter((id) => id === 'personalInfo');
    const body = orderedIds.filter((id) => id !== 'personalInfo');
    return `<article class="resume-template resume-template--creative" style="${baseStyle}">
      <header class="resume-creative-header" style="background:linear-gradient(135deg,${color},${accent})">${renderSections(header, sections, { ...opts, variant: 'creative' })}</header>
      <div class="resume-body">${renderSections(body, sections, { ...opts, variant: 'creative', headingStyle: 'creative' })}</div>
    </article>`;
  }

  return `<article style="${baseStyle};padding:32px">${renderSections(orderedIds, sections, opts)}</article>`;
};

export const renderResumeHtml = (resume) => {
  const config = getTemplateConfig(resume.template);
  const sectionData = buildSectionData(resume);
  const styles = getResumeStyles(resume.settings);
  const body = renderTemplateBody(resume, sectionData, styles, config);
  const title = esc(resume.title || 'Resume');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>${PDF_STYLES}</style>
</head>
<body>${body}</body>
</html>`;
};
