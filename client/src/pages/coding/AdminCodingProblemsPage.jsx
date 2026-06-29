import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { useAdminProblem, useCodingMutations, useProblems } from '@/hooks/useCoding';

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

const CATEGORIES = [
  { value: 'arrays', label: 'Arrays' },
  { value: 'strings', label: 'Strings' },
  { value: 'linked-list', label: 'Linked List' },
  { value: 'trees', label: 'Trees' },
  { value: 'graphs', label: 'Graphs' },
  { value: 'dynamic-programming', label: 'Dynamic Programming' },
  { value: 'math', label: 'Math' },
  { value: 'sorting', label: 'Sorting' },
  { value: 'searching', label: 'Searching' },
  { value: 'stack', label: 'Stack' },
  { value: 'queue', label: 'Queue' },
  { value: 'heap', label: 'Heap' },
  { value: 'greedy', label: 'Greedy' },
  { value: 'backtracking', label: 'Backtracking' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  difficulty: 'easy',
  category: 'arrays',
  sampleInput: '',
  sampleOutput: '',
  hiddenInput: '',
  hiddenOutput: '',
  constraints: '',
  points: 10,
  status: 'draft',
};

const problemToForm = (problem) => ({
  title: problem.title || '',
  description: problem.description || '',
  difficulty: problem.difficulty || 'easy',
  category: problem.category || 'other',
  sampleInput: problem.sampleTestCases?.[0]?.input || '',
  sampleOutput: problem.sampleTestCases?.[0]?.output || '',
  hiddenInput: problem.hiddenTestCases?.[0]?.input || '',
  hiddenOutput: problem.hiddenTestCases?.[0]?.output || '',
  constraints: problem.constraints || '',
  points: problem.points ?? 10,
  status: problem.status || 'draft',
});

const buildPayload = (form, existing = null) => {
  const sampleTestCases = [...(existing?.sampleTestCases || [])];
  if (sampleTestCases.length) {
    sampleTestCases[0] = { ...sampleTestCases[0], input: form.sampleInput, output: form.sampleOutput };
  } else {
    sampleTestCases.push({ input: form.sampleInput, output: form.sampleOutput });
  }

  const hiddenTestCases = [...(existing?.hiddenTestCases || [])];
  if (form.hiddenInput && form.hiddenOutput) {
    if (hiddenTestCases.length) {
      hiddenTestCases[0] = { ...hiddenTestCases[0], input: form.hiddenInput, output: form.hiddenOutput };
    } else {
      hiddenTestCases.push({ input: form.hiddenInput, output: form.hiddenOutput });
    }
  }

  return {
    title: form.title,
    description: form.description,
    difficulty: form.difficulty,
    category: form.category,
    constraints: form.constraints,
    sampleTestCases,
    hiddenTestCases,
    points: Number(form.points),
    status: form.status,
  };
};

export function AdminCodingProblemsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingProblem, setExistingProblem] = useState(null);
  const [error, setError] = useState(null);

  const { data, isLoading, refetch } = useProblems({ status: 'all', limit: 100 });
  const { data: editData, isLoading: editLoading } = useAdminProblem(editingId);
  const { adminCreateProblem, adminUpdateProblem, adminDeleteProblem } = useCodingMutations();

  const allProblems = data?.data?.problems || [];
  const isEditing = Boolean(editingId);

  useEffect(() => {
    if (!editData?.data?.problem) return;
    const problem = editData.data.problem;
    setExistingProblem(problem);
    setForm(problemToForm(problem));
    setShowForm(true);
    setError(null);
  }, [editData]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setExistingProblem(null);
    setShowForm(false);
    setError(null);
  };

  const startCreate = () => {
    setEditingId(null);
    setExistingProblem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError(null);
  };

  const startEdit = (problemId) => {
    setEditingId(problemId);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = buildPayload(form, existingProblem);

    try {
      if (isEditing) {
        await adminUpdateProblem.mutateAsync({ id: editingId, body: payload });
      } else {
        await adminCreateProblem.mutateAsync(payload);
      }
      resetForm();
      refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const isSaving = adminCreateProblem.isPending || adminUpdateProblem.isPending;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Coding Problems</h1>
          <p className="text-muted-foreground">Create, edit, and publish coding challenges</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/coding"><Button variant="outline">← Coding</Button></Link>
          <Button onClick={showForm && !isEditing ? resetForm : startCreate}>
            {showForm && !isEditing ? 'Cancel' : 'New Problem'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isEditing ? `Edit Problem${existingProblem ? `: ${existingProblem.title}` : ''}` : 'Create Problem'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing && editLoading ? (
              <Loader className="py-8" />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  required
                />
                <Textarea
                  placeholder="Constraints (optional)"
                  value={form.constraints}
                  onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                  rows={2}
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    options={DIFFICULTIES}
                  />
                  <Select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    options={CATEGORIES}
                  />
                  <Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    options={STATUSES}
                  />
                  <Input
                    type="number"
                    placeholder="Points"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: e.target.value })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Sample Input"
                    value={form.sampleInput}
                    onChange={(e) => setForm({ ...form, sampleInput: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Sample Output"
                    value={form.sampleOutput}
                    onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Hidden Input (for submit tests)"
                    value={form.hiddenInput}
                    onChange={(e) => setForm({ ...form, hiddenInput: e.target.value })}
                  />
                  <Input
                    placeholder="Hidden Output"
                    value={form.hiddenOutput}
                    onChange={(e) => setForm({ ...form, hiddenOutput: e.target.value })}
                  />
                </div>
                {isEditing && existingProblem?.status === 'published' && (
                  <p className="text-xs text-muted-foreground">
                    Published problems stay live after save. Changes apply immediately for all users.
                  </p>
                )}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Problem'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Loader className="py-8" />
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">All Problems</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {allProblems.length === 0 && (
              <p className="text-sm text-muted-foreground">No problems yet. Create one to get started.</p>
            )}
            {allProblems.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border p-3 text-sm">
                <div>
                  <span className="font-medium">{p.title}</span>
                  <Badge className="ml-2 capitalize">{p.difficulty}</Badge>
                  <Badge variant="outline" className="ml-1 capitalize">{p.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => startEdit(p.id)}>
                    Edit
                  </Button>
                  <Link to={`/coding/problems/${p.slug}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Delete "${p.title}"?`)) adminDeleteProblem.mutate(p.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
