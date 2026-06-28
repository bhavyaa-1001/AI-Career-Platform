import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AdminPageHeader, AdminTable } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { adminApi } from '@/lib/api/admin';
import { useAdminInterviews, useAdminQuestions, useAdminTemplates } from '@/hooks/useAdmin';

export function AdminInterviewsPage() {
  const [tab, setTab] = useState('records');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', category: 'general', difficulty: 'medium' });
  const qc = useQueryClient();

  const { data: recordsData, isLoading: recordsLoading } = useAdminInterviews({ page: 1, limit: 20 });
  const { data: templatesData } = useAdminTemplates({ page: 1, limit: 20 });
  const { data: questionsData } = useAdminQuestions({ page: 1, limit: 20 });

  const deleteRecord = useMutation({
    mutationFn: adminApi.deleteInterview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'interviews'] }),
  });
  const createQuestion = useMutation({
    mutationFn: adminApi.createQuestion,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'questions'] }); setShowForm(false); },
  });
  const deleteQuestion = useMutation({
    mutationFn: adminApi.deleteQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'questions'] }),
  });

  if (recordsLoading) return <Loader className="py-20" />;

  const tabs = [
    { id: 'records', label: 'Interview Records' },
    { id: 'templates', label: 'AI Templates' },
    { id: 'questions', label: 'Question Bank' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Interview Management" description="View records, manage AI templates and question bank" />

      <div className="flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium ${tab === t.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'records' && (
        <AdminTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status' },
            { key: 'score', label: 'Score', render: (r) => r.score != null ? `${r.score}%` : '—' },
            { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
            { key: 'actions', label: '', render: (r) => <Button size="sm" variant="ghost" onClick={() => deleteRecord.mutate(r.id)}>Delete</Button> },
          ]}
          rows={recordsData?.data?.records || []}
        />
      )}

      {tab === 'templates' && (
        <AdminTable
          columns={[
            { key: 'name', label: 'Template' },
            { key: 'category', label: 'Category' },
            { key: 'duration', label: 'Duration', render: (r) => `${r.duration} min` },
            { key: 'isActive', label: 'Active', render: (r) => r.isActive ? '✓' : '✗' },
          ]}
          rows={templatesData?.data?.templates || []}
        />
      )}

      {tab === 'questions' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Question'}</Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle className="text-base">New Question</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={3} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="system_design">System Design</option>
                    <option value="coding">Coding</option>
                  </Select>
                  <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </div>
                <Button onClick={() => createQuestion.mutate(form)} disabled={!form.question}>Create</Button>
              </CardContent>
            </Card>
          )}
          <AdminTable
            columns={[
              { key: 'question', label: 'Question', render: (r) => r.question.slice(0, 80) + (r.question.length > 80 ? '...' : '') },
              { key: 'category', label: 'Category' },
              { key: 'difficulty', label: 'Difficulty' },
              { key: 'actions', label: '', render: (r) => <Button size="sm" variant="ghost" onClick={() => deleteQuestion.mutate(r.id)}>Delete</Button> },
            ]}
            rows={questionsData?.data?.questions || []}
          />
        </>
      )}
    </div>
  );
}
