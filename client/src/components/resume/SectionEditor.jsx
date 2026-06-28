import { useState } from 'react';

import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui';
import {
  LANGUAGE_LEVELS,
  PROFICIENCY_LEVELS,
  emptyAchievement,
  emptyCertificate,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  emptyProject,
  emptySkill,
} from '@/features/resume/constants';

function FieldGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function PersonalInfoEditor({ content, onChange }) {
  const update = (field, value) => onChange({ personalInfo: { ...content.personalInfo, [field]: value } });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldGroup label="Full Name"><Input value={content.personalInfo.fullName} onChange={(e) => update('fullName', e.target.value)} /></FieldGroup>
      <FieldGroup label="Email"><Input type="email" value={content.personalInfo.email} onChange={(e) => update('email', e.target.value)} /></FieldGroup>
      <FieldGroup label="Phone"><Input value={content.personalInfo.phone} onChange={(e) => update('phone', e.target.value)} /></FieldGroup>
      <FieldGroup label="Location"><Input value={content.personalInfo.location} onChange={(e) => update('location', e.target.value)} /></FieldGroup>
      <FieldGroup label="Headline"><Input value={content.personalInfo.headline} onChange={(e) => update('headline', e.target.value)} /></FieldGroup>
      <FieldGroup label="Website"><Input value={content.personalInfo.website} onChange={(e) => update('website', e.target.value)} /></FieldGroup>
    </div>
  );
}

function SummaryEditor({ content, onChange }) {
  return (
    <FieldGroup label="Professional Summary">
      <Textarea rows={6} value={content.summary.text} onChange={(e) => onChange({ summary: { text: e.target.value } })} placeholder="Brief overview of your experience and goals..." />
    </FieldGroup>
  );
}

function SocialLinksEditor({ content, onChange }) {
  const update = (field, value) => onChange({ socialLinks: { ...content.socialLinks, [field]: value } });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {['github', 'linkedin', 'portfolio', 'twitter'].map((field) => (
        <FieldGroup key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
          <Input value={content.socialLinks[field] || ''} onChange={(e) => update(field, e.target.value)} placeholder={`https://${field}.com/...`} />
        </FieldGroup>
      ))}
    </div>
  );
}

function InterestsEditor({ content, onChange }) {
  const value = (content.interests || []).join(', ');
  return (
    <FieldGroup label="Interests (comma-separated)">
      <Input value={value} onChange={(e) => onChange({ interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Reading, Open Source, Photography" />
    </FieldGroup>
  );
}

function ItemForm({ fields, data, onSave, onCancel, saveLabel = 'Save' }) {
  const [form, setForm] = useState(data);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      {fields.map(({ key, label, type = 'text', options }) => (
        <FieldGroup key={key} label={label}>
          {type === 'textarea' ? (
            <Textarea rows={3} value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
          ) : type === 'checkbox' ? (
            <Checkbox checked={Boolean(form[key])} onChange={(e) => set(key, e.target.checked)} label="Currently active" />
          ) : type === 'select' ? (
            <Select value={form[key] || ''} onChange={(e) => set(key, e.target.value)} options={options} />
          ) : (
            <Input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
          )}
        </FieldGroup>
      ))}
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => onSave(form)}>{saveLabel}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function ArraySectionEditor({ items = [], emptyItem, sectionKey, onChange, fields, getTitle }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const save = (data) => {
    const list = [...items];
    if (editing !== null) {
      list[editing] = { ...list[editing], ...data };
    } else {
      list.push({ ...emptyItem(), ...data, id: crypto.randomUUID() });
    }
    onChange({ [sectionKey]: list });
    setEditing(null);
    setShowForm(false);
  };

  const remove = (index) => {
    onChange({ [sectionKey]: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id || i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="truncate text-sm font-medium">{getTitle(item)}</span>
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(i); setShowForm(true); }}>Edit</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>Remove</Button>
          </div>
        </div>
      ))}
      {showForm ? (
        <ItemForm
          fields={fields}
          data={editing !== null ? items[editing] : emptyItem()}
          onSave={save}
          onCancel={() => { setEditing(null); setShowForm(false); }}
          saveLabel={editing !== null ? 'Update' : 'Add'}
        />
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add entry
        </Button>
      )}
    </div>
  );
}

const experienceFields = [
  { key: 'title', label: 'Job Title' },
  { key: 'company', label: 'Company' },
  { key: 'location', label: 'Location' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'isCurrent', label: 'Current', type: 'checkbox' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const educationFields = [
  { key: 'institution', label: 'Institution' },
  { key: 'degree', label: 'Degree' },
  { key: 'fieldOfStudy', label: 'Field of Study' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'isCurrent', label: 'Currently studying', type: 'checkbox' },
  { key: 'grade', label: 'Grade / GPA' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const projectFields = [
  { key: 'title', label: 'Project Title' },
  { key: 'url', label: 'URL' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const skillFields = [
  { key: 'name', label: 'Skill' },
  { key: 'proficiency', label: 'Proficiency', type: 'select', options: PROFICIENCY_LEVELS.map((p) => ({ value: p, label: p })) },
];

const certificateFields = [
  { key: 'name', label: 'Certificate Name' },
  { key: 'issuer', label: 'Issuer' },
  { key: 'issueDate', label: 'Issue Date' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'credentialId', label: 'Credential ID' },
  { key: 'url', label: 'URL' },
];

const achievementFields = [
  { key: 'title', label: 'Title' },
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const languageFields = [
  { key: 'name', label: 'Language' },
  { key: 'proficiency', label: 'Proficiency', type: 'select', options: LANGUAGE_LEVELS.map((p) => ({ value: p, label: p })) },
];

export function SectionEditor({ section, content, onChange }) {
  switch (section) {
    case 'personalInfo':
      return <PersonalInfoEditor content={content} onChange={onChange} />;
    case 'summary':
      return <SummaryEditor content={content} onChange={onChange} />;
    case 'socialLinks':
      return <SocialLinksEditor content={content} onChange={onChange} />;
    case 'interests':
      return <InterestsEditor content={content} onChange={onChange} />;
    case 'experience':
      return <ArraySectionEditor items={content.experience} emptyItem={emptyExperience} sectionKey="experience" onChange={onChange} fields={experienceFields} getTitle={(i) => i.title || 'Untitled role'} />;
    case 'education':
      return <ArraySectionEditor items={content.education} emptyItem={emptyEducation} sectionKey="education" onChange={onChange} fields={educationFields} getTitle={(i) => i.degree || i.institution || 'Untitled'} />;
    case 'projects':
      return <ArraySectionEditor items={content.projects} emptyItem={emptyProject} sectionKey="projects" onChange={onChange} fields={projectFields} getTitle={(i) => i.title || 'Untitled project'} />;
    case 'skills':
      return <ArraySectionEditor items={content.skills} emptyItem={emptySkill} sectionKey="skills" onChange={onChange} fields={skillFields} getTitle={(i) => i.name || 'Skill'} />;
    case 'certificates':
      return <ArraySectionEditor items={content.certificates} emptyItem={emptyCertificate} sectionKey="certificates" onChange={onChange} fields={certificateFields} getTitle={(i) => i.name || 'Certificate'} />;
    case 'achievements':
      return <ArraySectionEditor items={content.achievements} emptyItem={emptyAchievement} sectionKey="achievements" onChange={onChange} fields={achievementFields} getTitle={(i) => i.title || 'Achievement'} />;
    case 'languages':
      return <ArraySectionEditor items={content.languages} emptyItem={emptyLanguage} sectionKey="languages" onChange={onChange} fields={languageFields} getTitle={(i) => i.name || 'Language'} />;
    default:
      return null;
  }
}
