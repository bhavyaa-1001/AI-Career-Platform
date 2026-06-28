import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ProblemCard } from '@/components/coding/CodingWidgets';
import { Loader } from '@/components/common';
import { Input, Select } from '@/components/ui';
import { useProblems } from '@/hooks/useCoding';

const DIFFICULTIES = [
  { value: '', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function ProblemsBrowsePage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProblems({ search, difficulty, page, limit: 20 });
  const problems = data?.data?.problems || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Problems</h1>
        <p className="text-muted-foreground">Practice coding challenges by difficulty and topic</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search problems…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
        <Select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} options={DIFFICULTIES} className="w-40" />
      </div>

      {isLoading ? <Loader className="py-12" /> : (
        <div className="space-y-2">
          {problems.map((p) => (
            <Link key={p.id} to={`/coding/problems/${p.slug}`}>
              <ProblemCard problem={p} />
            </Link>
          ))}
          {!problems.length && <p className="py-8 text-center text-muted-foreground">No problems found. Run npm run seed:coding on the server.</p>}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="text-sm text-primary disabled:opacity-50">← Prev</button>
          <span className="text-sm text-muted-foreground">Page {page} of {pagination.pages}</span>
          <button type="button" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="text-sm text-primary disabled:opacity-50">Next →</button>
        </div>
      )}
    </div>
  );
}
