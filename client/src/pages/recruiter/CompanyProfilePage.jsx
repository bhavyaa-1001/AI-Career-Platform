import { useEffect, useState } from 'react';

import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { useCompany, useRecruiterMutations } from '@/hooks/useRecruiter';

const SIZE_OPTIONS = [
  { value: '', label: 'Select size…' },
  { value: '1-10', label: '1–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '201-500', label: '201–500' },
  { value: '501-1000', label: '501–1000' },
  { value: '1000+', label: '1000+' },
];

export function CompanyProfilePage() {
  const { data, isLoading } = useCompany();
  const { updateCompany } = useRecruiterMutations();
  const [form, setForm] = useState({
    name: '', description: '', website: '', logoUrl: '',
    industry: '', size: '', location: '', foundedYear: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data?.data?.company) {
      const c = data.data.company;
      setForm({
        name: c.name || '',
        description: c.description || '',
        website: c.website || '',
        logoUrl: c.logoUrl || '',
        industry: c.industry || '',
        size: c.size || '',
        location: c.location || '',
        foundedYear: c.foundedYear ?? '',
      });
    }
  }, [data]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    try {
      await updateCompany.mutateAsync({
        ...form,
        foundedYear: form.foundedYear === '' ? null : Number(form.foundedYear),
      });
      setMessage('Company profile saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
        <p className="mt-1 text-muted-foreground">Your company info appears on job listings.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Company Name</label>
              <Input value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={set('description')} rows={4} placeholder="About your company…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Website</label>
                <Input value={form.website} onChange={set('website')} placeholder="https://…" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Logo URL</label>
                <Input value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://…" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Industry</label>
                <Input value={form.industry} onChange={set('industry')} placeholder="Technology" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Company Size</label>
                <Select value={form.size} onChange={set('size')} options={SIZE_OPTIONS} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <Input value={form.location} onChange={set('location')} placeholder="New York, NY" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Founded Year</label>
                <Input type="number" value={form.foundedYear} onChange={set('foundedYear')} placeholder="2010" />
              </div>
            </div>
            <Button type="submit" disabled={updateCompany.isPending}>
              {updateCompany.isPending ? 'Saving…' : 'Save Profile'}
            </Button>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
