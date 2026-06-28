import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';

import { CandidateRankBadge, StatusBadge } from './CandidateRankBadge';

export function ApplicantTable({ applications }) {
  if (!applications?.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No applicants yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Candidate</th>
            <th className="pb-3 pr-4 font-medium">Rank</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Applied</th>
            <th className="pb-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-muted/30">
              <td className="py-3 pr-4">
                <p className="font-medium">{app.applicantName || 'Candidate'}</p>
                <p className="text-xs text-muted-foreground">{app.applicantEmail}</p>
              </td>
              <td className="py-3 pr-4"><CandidateRankBadge score={app.rankingScore} /></td>
              <td className="py-3 pr-4"><StatusBadge status={app.status} /></td>
              <td className="py-3 pr-4 text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 text-right">
                <Link to={`/recruiter/applicants/${app.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
