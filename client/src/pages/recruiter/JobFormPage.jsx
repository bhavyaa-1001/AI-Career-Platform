import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { formToPayload, JobForm, jobToForm } from '@/components/recruiter/JobForm';
import { Loader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useRecruiterJob, useRecruiterMutations } from '@/hooks/useRecruiter';

export function JobFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { data, isLoading } = useRecruiterJob(id);
  const { createJob, updateJob } = useRecruiterMutations();
  const [form, setForm] = useState(jobToForm());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data?.data?.job) setForm(jobToForm(data.data.job));
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = formToPayload(form);
    try {
      if (isEdit) {
        await updateJob.mutateAsync({ id, ...payload });
        navigate('/recruiter/jobs');
      } else {
        const res = await createJob.mutateAsync(payload);
        navigate(`/recruiter/jobs/${res.data.job.id}/edit`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (isEdit && isLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Job' : 'Post Job'}</h1>
        <p className="mt-1 text-muted-foreground">
          {isEdit ? 'Update job details and status.' : 'Create a new job posting. Set status to Open to accept applications.'}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Job Details</CardTitle></CardHeader>
        <CardContent>
          <JobForm
            form={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            loading={createJob.isPending || updateJob.isPending}
            submitLabel={isEdit ? 'Update Job' : 'Create Job'}
          />
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
