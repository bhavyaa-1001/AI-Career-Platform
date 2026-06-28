import { Button, Input, Select, Textarea } from '@/components/ui';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

const TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

const emptyForm = {
  title: '',
  description: '',
  requirements: '',
  responsibilities: '',
  location: '',
  employmentType: 'full-time',
  salaryMin: '',
  salaryMax: '',
  skills: '',
  status: 'draft',
};

export function jobToForm(job) {
  if (!job) return { ...emptyForm };
  return {
    title: job.title || '',
    description: job.description || '',
    requirements: job.requirements || '',
    responsibilities: job.responsibilities || '',
    location: job.location || '',
    employmentType: job.employmentType || 'full-time',
    salaryMin: job.salaryMin ?? '',
    salaryMax: job.salaryMax ?? '',
    skills: (job.skills || []).join(', '),
    status: job.status || 'draft',
  };
}

export function formToPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    requirements: form.requirements.trim(),
    responsibilities: form.responsibilities.trim(),
    location: form.location.trim(),
    employmentType: form.employmentType,
    salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
    salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
    skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    status: form.status,
  };
}

export function JobForm({ form, onChange, onSubmit, loading, submitLabel = 'Save Job' }) {
  const set = (field) => (e) => onChange({ ...form, [field]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Job Title</label>
        <Input value={form.title} onChange={set('title')} placeholder="Senior Software Engineer" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <Input value={form.location} onChange={set('location')} placeholder="San Francisco, CA" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Employment Type</label>
          <Select value={form.employmentType} onChange={set('employmentType')} options={TYPE_OPTIONS} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Salary Min</label>
          <Input type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="80000" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Salary Max</label>
          <Input type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="120000" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <Select value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Skills (comma-separated)</label>
        <Input value={form.skills} onChange={set('skills')} placeholder="React, Node.js, TypeScript" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={set('description')} rows={5} required placeholder="Describe the role…" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Requirements</label>
        <Textarea value={form.requirements} onChange={set('requirements')} rows={4} placeholder="Required qualifications…" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Responsibilities</label>
        <Textarea value={form.responsibilities} onChange={set('responsibilities')} rows={4} placeholder="Key responsibilities…" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : submitLabel}</Button>
    </form>
  );
}
