import { RenderSection } from '../SectionBlocks';

function splitSections(orderedIds, sections, sidebarIds) {
  return {
    main: orderedIds.filter((id) => !sidebarIds.includes(id)),
    sidebar: orderedIds.filter((id) => sidebarIds.includes(id)),
  };
}

function SectionList({ ids, sections, color, accent, headingStyle, variant, light }) {
  return ids.map((id) => (
    <RenderSection
      key={id}
      section={sections[id]}
      color={color}
      accent={accent}
      headingStyle={headingStyle}
      variant={variant}
      light={light}
    />
  ));
}

function getPageLayout(resume, config) {
  return resume.settings?.pageLayout || config.defaultSettings.pageLayout || 'single';
}

export function ModernTemplate({ resume, sectionData, styles, config }) {
  const { sections, orderedIds } = sectionData;
  const { color, accent, baseStyle } = styles;
  const layout = getPageLayout(resume, config);
  const useSidebar = layout !== 'single';
  const sidebarLeft = layout === 'sidebar-left';
  const { main, sidebar } = splitSections(orderedIds, sections, useSidebar ? config.sidebarSections : []);

  const mainCol = (
    <div className="resume-main" style={{ flex: 1, padding: '32px 28px' }}>
      <SectionList ids={main} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="modern" />
    </div>
  );

  const sidebarCol = sidebar.length > 0 && (
    <aside className="resume-sidebar" style={{ width: '34%', background: color, color: '#fff', padding: '32px 20px', fontSize: '0.92em' }}>
      <SectionList ids={sidebar} sections={sections} color="#fff" accent={accent} headingStyle={config.headingStyle} variant="modern" light />
    </aside>
  );

  return (
    <article className="resume-template resume-template--modern" style={{ ...baseStyle, display: 'flex', flexDirection: sidebarLeft ? 'row-reverse' : 'row', minHeight: '100%' }}>
      {mainCol}
      {sidebarCol}
    </article>
  );
}

export function CorporateTemplate({ sectionData, styles, config }) {
  const { sections, orderedIds } = sectionData;
  const { color, accent, baseStyle } = styles;

  return (
    <article className="resume-template resume-template--corporate" style={{ ...baseStyle, padding: '36px 40px', maxWidth: '100%' }}>
      <SectionList ids={orderedIds} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="corporate" />
    </article>
  );
}

export function MinimalTemplate({ sectionData, styles, config }) {
  const { sections, orderedIds } = sectionData;
  const { color, accent, baseStyle } = styles;

  return (
    <article className="resume-template resume-template--minimal" style={{ ...baseStyle, padding: '48px 56px', maxWidth: '100%' }}>
      <SectionList ids={orderedIds} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="minimal" />
    </article>
  );
}

export function DeveloperTemplate({ resume, sectionData, styles, config }) {
  const { sections, orderedIds } = sectionData;
  const { color, accent, baseStyle } = styles;
  const layout = getPageLayout(resume, config);
  const personal = orderedIds.filter((id) => id === 'personalInfo');
  const rest = orderedIds.filter((id) => id !== 'personalInfo');
  const useGrid = layout !== 'single';
  const { main, sidebar } = splitSections(rest, sections, useGrid ? config.sidebarSections : []);

  if (!useGrid) {
    return (
      <article className="resume-template resume-template--developer" style={{ ...baseStyle, padding: '28px 32px' }}>
        <SectionList ids={orderedIds} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="developer" />
      </article>
    );
  }

  return (
    <article className="resume-template resume-template--developer" style={{ ...baseStyle, padding: '28px 32px' }}>
      <SectionList ids={personal} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="developer" />
      <div className="resume-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>
        <div><SectionList ids={main} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="developer" /></div>
        <aside><SectionList ids={sidebar} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="developer" /></aside>
      </div>
    </article>
  );
}

export function CreativeTemplate({ sectionData, styles, config }) {
  const { sections, orderedIds } = sectionData;
  const { color, accent, baseStyle } = styles;
  const header = orderedIds.filter((id) => id === 'personalInfo');
  const body = orderedIds.filter((id) => id !== 'personalInfo');

  return (
    <article className="resume-template resume-template--creative" style={baseStyle}>
      <header className="resume-creative-header" style={{ background: `linear-gradient(135deg, ${color}, ${accent})`, padding: '32px 36px', marginBottom: 24 }}>
        <SectionList ids={header} sections={sections} color={color} accent={accent} headingStyle={config.headingStyle} variant="creative" />
      </header>
      <div style={{ padding: '0 36px 36px' }}>
        <SectionList ids={body} sections={sections} color={color} accent={accent} headingStyle="creative" variant="creative" />
      </div>
    </article>
  );
}
