import { formatDateRange } from './sectionData';

const HEADING_STYLES = {
  underline: (color) => ({
    borderBottom: `2px solid ${color}`,
    paddingBottom: 4,
    marginBottom: 12,
    fontSize: '1em',
    fontWeight: 700,
  }),
  bold: (color) => ({
    fontWeight: 700,
    color,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: '0.82em',
  }),
  minimal: (color) => ({
    fontWeight: 600,
    color,
    marginBottom: 8,
    fontSize: '0.92em',
  }),
  developer: (color) => ({
    fontWeight: 700,
    color,
    marginBottom: 10,
    fontSize: '0.78em',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: 'Consolas, Monaco, monospace',
    borderLeft: `3px solid ${color}`,
    paddingLeft: 8,
  }),
  creative: (color, accent) => ({
    fontWeight: 700,
    color: '#fff',
    background: color,
    display: 'inline-block',
    padding: '4px 12px',
    marginBottom: 12,
    fontSize: '0.85em',
    borderRadius: 2,
    boxShadow: `3px 3px 0 ${accent}`,
  }),
};

export function SectionHeading({ title, color, accent, style = 'underline' }) {
  const styleFn = HEADING_STYLES[style] || HEADING_STYLES.underline;
  const headingStyle = style === 'creative' ? styleFn(color, accent) : styleFn(color);
  return <h2 style={headingStyle}>{title}</h2>;
}

export function PersonalInfoBlock({ data, color, variant = 'default' }) {
  const p = data || {};
  const contact = [p.email, p.phone, p.location, p.website].filter(Boolean);

  if (variant === 'corporate') {
    return (
      <header style={{ textAlign: 'center', marginBottom: 24, borderBottom: `2px solid ${color}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: '1.85em', fontWeight: 700, margin: 0, color, letterSpacing: '0.02em' }}>{p.fullName || 'Your Name'}</h1>
        {p.headline && <p style={{ margin: '8px 0 0', color: '#444', fontSize: '1em' }}>{p.headline}</p>}
        {contact.length > 0 && <p style={{ margin: '10px 0 0', fontSize: '0.88em', color: '#666' }}>{contact.join(' · ')}</p>}
      </header>
    );
  }

  if (variant === 'creative') {
    return (
      <header style={{ marginBottom: 0 }}>
        <h1 style={{ fontSize: '2em', fontWeight: 800, margin: 0, color: '#fff' }}>{p.fullName || 'Your Name'}</h1>
        {p.headline && <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '1.05em' }}>{p.headline}</p>}
        {contact.length > 0 && <p style={{ margin: '10px 0 0', fontSize: '0.88em', color: 'rgba(255,255,255,0.85)' }}>{contact.join(' · ')}</p>}
      </header>
    );
  }

  if (variant === 'developer') {
    return (
      <header style={{ marginBottom: 20, borderBottom: `1px dashed ${color}`, paddingBottom: 14 }}>
        <h1 style={{ fontSize: '1.7em', fontWeight: 700, margin: 0, color, fontFamily: 'Consolas, Monaco, monospace' }}>
          {'<'}{p.fullName || 'Your Name'}{' />'}
        </h1>
        {p.headline && <p style={{ margin: '6px 0 0', color: '#555' }}>{p.headline}</p>}
        {contact.length > 0 && (
          <p style={{ margin: '8px 0 0', fontSize: '0.85em', color: '#666', fontFamily: 'Consolas, Monaco, monospace' }}>
            {contact.join(' · ')}
          </p>
        )}
      </header>
    );
  }

  if (variant === 'minimal') {
    return (
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6em', fontWeight: 600, margin: 0, color: '#111' }}>{p.fullName || 'Your Name'}</h1>
        {p.headline && <p style={{ margin: '6px 0 0', color: '#666' }}>{p.headline}</p>}
        {contact.length > 0 && <p style={{ margin: '8px 0 0', fontSize: '0.85em', color: '#888' }}>{contact.join(' · ')}</p>}
      </header>
    );
  }

  return (
    <header style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: '1.75em', fontWeight: 700, margin: 0, color }}>{p.fullName || 'Your Name'}</h1>
      {p.headline && <p style={{ margin: '6px 0 0', color: '#555', fontSize: '1.05em' }}>{p.headline}</p>}
      {contact.length > 0 && <p style={{ margin: '8px 0 0', fontSize: '0.9em', color: '#666' }}>{contact.join(' · ')}</p>}
    </header>
  );
}

export function SummaryBlock({ data, color, accent, headingStyle }) {
  return (
    <section className="resume-section" aria-label="Professional Summary" style={{ marginBottom: 16 }}>
      <SectionHeading title="Professional Summary" color={color} accent={accent} style={headingStyle} />
      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{data.text}</p>
    </section>
  );
}

export function ExperienceBlock({ data, color, accent, headingStyle }) {
  return (
    <section className="resume-section" aria-label="Experience" style={{ marginBottom: 16 }}>
      <SectionHeading title="Experience" color={color} accent={accent} style={headingStyle} />
      {data.map((exp, i) => (
        <article key={exp.id || i} className="resume-entry" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
            <strong>{exp.title}{exp.company ? ` — ${exp.company}` : ''}</strong>
            <span style={{ color: '#666', fontSize: '0.9em' }}>{formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}</span>
          </div>
          {exp.location && <div style={{ color: '#666', fontSize: '0.85em' }}>{exp.location}</div>}
          {exp.description && <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
        </article>
      ))}
    </section>
  );
}

export function EducationBlock({ data, color, accent, headingStyle }) {
  return (
    <section className="resume-section" aria-label="Education" style={{ marginBottom: 16 }}>
      <SectionHeading title="Education" color={color} accent={accent} style={headingStyle} />
      {data.map((edu, i) => (
        <article key={edu.id || i} style={{ marginBottom: 10 }}>
          <strong>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</strong>
          <div style={{ color: '#666', fontSize: '0.9em' }}>
            {edu.institution}{edu.grade ? ` · ${edu.grade}` : ''} · {formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}
          </div>
          {edu.description && <p style={{ margin: '4px 0 0', fontSize: '0.9em' }}>{edu.description}</p>}
        </article>
      ))}
    </section>
  );
}

export function SkillsBlock({ data, color, accent, headingStyle, variant }) {
  if (variant === 'developer') {
    return (
      <section className="resume-section" aria-label="Skills" style={{ marginBottom: 16 }}>
        <SectionHeading title="Skills" color={color} accent={accent} style={headingStyle} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.map((s, i) => (
            <span key={s.id || i} style={{ background: `${color}15`, color, padding: '3px 8px', borderRadius: 4, fontSize: '0.85em', fontFamily: 'Consolas, Monaco, monospace' }}>
              {s.name}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="resume-section" aria-label="Skills" style={{ marginBottom: 16 }}>
      <SectionHeading title="Skills" color={color} accent={accent} style={headingStyle} />
      <p style={{ margin: 0 }}>{data.map((s) => `${s.name}${s.proficiency ? ` (${s.proficiency})` : ''}`).join(' · ')}</p>
    </section>
  );
}

export function ProjectsBlock({ data, color, accent, headingStyle, variant }) {
  return (
    <section className="resume-section" aria-label="Projects" style={{ marginBottom: 16 }}>
      <SectionHeading title="Projects" color={color} accent={accent} style={headingStyle} />
      {data.map((proj, i) => (
        <article key={proj.id || i} style={{ marginBottom: 10 }}>
          <strong style={variant === 'developer' ? { fontFamily: 'Consolas, Monaco, monospace' } : undefined}>{proj.title}</strong>
          {proj.url && <span style={{ color, fontSize: '0.85em' }}> — {proj.url}</span>}
          {proj.technologies?.length > 0 && (
            <div style={{ fontSize: '0.85em', color: '#666', fontFamily: variant === 'developer' ? 'Consolas, Monaco, monospace' : undefined }}>
              [{proj.technologies.join(' · ')}]
            </div>
          )}
          {proj.description && <p style={{ margin: '4px 0 0' }}>{proj.description}</p>}
        </article>
      ))}
    </section>
  );
}

export function CertificatesBlock({ data, color, accent, headingStyle }) {
  return (
    <section className="resume-section" aria-label="Certificates" style={{ marginBottom: 16 }}>
      <SectionHeading title="Certificates" color={color} accent={accent} style={headingStyle} />
      {data.map((cert, i) => (
        <div key={cert.id || i} style={{ marginBottom: 8 }}>
          <strong>{cert.name}</strong>
          {cert.issuer && <span style={{ color: '#666' }}> — {cert.issuer}</span>}
          {cert.issueDate && <span style={{ color: '#666', fontSize: '0.85em' }}> ({cert.issueDate})</span>}
        </div>
      ))}
    </section>
  );
}

export function AchievementsBlock({ data, color, accent, headingStyle }) {
  return (
    <section className="resume-section" aria-label="Achievements" style={{ marginBottom: 16 }}>
      <SectionHeading title="Achievements" color={color} accent={accent} style={headingStyle} />
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {data.map((a, i) => (
          <li key={a.id || i} style={{ marginBottom: 4 }}>
            <strong>{a.title}</strong>
            {a.date && <span style={{ color: '#666' }}> ({a.date})</span>}
            {a.description && ` — ${a.description}`}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LanguagesBlock({ data, color, accent, headingStyle }) {
  return (
    <section className="resume-section" aria-label="Languages" style={{ marginBottom: 16 }}>
      <SectionHeading title="Languages" color={color} accent={accent} style={headingStyle} />
      <p style={{ margin: 0 }}>{data.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' · ')}</p>
    </section>
  );
}

export function InterestsBlock({ data, color, accent, headingStyle }) {
  return (
    <section className="resume-section" aria-label="Interests" style={{ marginBottom: 16 }}>
      <SectionHeading title="Interests" color={color} accent={accent} style={headingStyle} />
      <p style={{ margin: 0 }}>{data.join(' · ')}</p>
    </section>
  );
}

export function SocialLinksBlock({ data, color, accent, headingStyle, light = false }) {
  const textColor = light ? 'rgba(255,255,255,0.9)' : undefined;
  return (
    <section className="resume-section" aria-label="Links" style={{ marginBottom: 16, color: textColor }}>
      <SectionHeading title="Links" color={light ? '#fff' : color} accent={accent} style={headingStyle} />
      <p style={{ margin: 0 }}>{data.map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
    </section>
  );
}

export function RenderSection({ section, color, accent, headingStyle, variant, light = false }) {
  if (!section) return null;
  const props = { color, accent, headingStyle, variant, light, data: section.data };

  switch (section.type) {
    case 'personalInfo': return <PersonalInfoBlock {...props} />;
    case 'summary': return <SummaryBlock {...props} />;
    case 'experience': return <ExperienceBlock {...props} />;
    case 'education': return <EducationBlock {...props} />;
    case 'projects': return <ProjectsBlock {...props} />;
    case 'skills': return <SkillsBlock {...props} />;
    case 'certificates': return <CertificatesBlock {...props} />;
    case 'achievements': return <AchievementsBlock {...props} />;
    case 'languages': return <LanguagesBlock {...props} />;
    case 'interests': return <InterestsBlock {...props} />;
    case 'socialLinks': return <SocialLinksBlock {...props} />;
    default: return null;
  }
}
