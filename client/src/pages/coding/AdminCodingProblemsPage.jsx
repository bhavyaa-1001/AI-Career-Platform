import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { useProblems, useCodingMutations } from '@/hooks/useCoding';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const EMPTY_FORM = {
  title: '', description: '', difficulty: 'easy', category: 'arrays',
  sampleInput: '', sampleOutput: '', points: 10, status: 'draft',
};

export function AdminCodingProblemsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const { data, isLoading, refetch } = useProblems({ status: 'draft', limit: 50 });
  const { data: pubData } = useProblems({ status: 'published', limit: 50 });
  const { adminCreateProblem, adminDeleteProblem } = useCodingMutations();

  const allProblems = [
    ...(data?.data?.problems || []),
    ...(pubData?.data?.problems || []),
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await adminCreateProblem.mutateAsync({
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        category: form.category,
        sampleTestCases: [{ input: form.sampleInput, output: form.sampleOutput }],
        hiddenTestCases: [],
        points: Number(form.points),
        status: form.status,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Coding Problems</h1>
          <p className="text-muted-foreground">Admin-only CRUD for coding challenges</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/coding"><Button variant="outline">← Coding</Button></Link>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Problem'}</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Problem</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} required />
              <div className="grid gap-3 sm:grid-cols-3">
                <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} options={DIFFICULTIES} />
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} />
                <Input type="number" placeholder="Points" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
              </div>
              <Input placeholder="Sample Input" value={form.sampleInput} onChange={(e) => setForm({ ...form, sampleInput: e.target.value })} required />
              <Input placeholder="Sample Output" value={form.sampleOutput} onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })} required />
              <Button type="submit" disabled={adminCreateProblem.isPending}>Create Problem</Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Loader className="py-8" /> : (
        <Card>
          <CardHeader><CardTitle className="text-base">All Problems</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {allProblems.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border border-border p-3 text-sm">
                <div>
                  <span className="font-medium">{p.title}</span>
                  <Badge className="ml-2 capitalize">{p.difficulty}</Badge>
                  <Badge variant="outline" className="ml-1 capitalize">{p.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <Link to={`/coding/problems/${p.slug}`}><Button variant="outline" size="sm">View</Button></Link>
                  <Button variant="destructive" size="sm" onClick={() => adminDeleteProblem.mutate(p.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
