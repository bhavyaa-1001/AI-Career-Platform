import { Badge, Button, Card, CardContent, Input, Select } from '@/components/ui';
import { EMPLOYMENT_TYPE_OPTIONS, SORT_OPTIONS } from '@/hooks/useJobs';

export function JobFilters({ filters, onChange, onReset, total }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value, page: 1 });

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filters</p>
          {total != null && (
            <Badge variant="outline">{total} job{total !== 1 ? 's' : ''}</Badge>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
          <Input
            value={filters.search}
            onChange={set('search')}
            placeholder="Title, company, location…"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Employment type</label>
          <Select value={filters.employmentType} onChange={set('employmentType')} options={EMPLOYMENT_TYPE_OPTIONS} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
          <Input value={filters.location} onChange={set('location')} placeholder="City or remote" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Skill</label>
          <Input value={filters.skill} onChange={set('skill')} placeholder="e.g. React" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Min salary</label>
          <Input type="number" value={filters.salaryMin} onChange={set('salaryMin')} placeholder="50000" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort by</label>
          <Select value={filters.sort} onChange={set('sort')} options={SORT_OPTIONS} />
        </div>

        <Button type="button" variant="outline" size="sm" className="w-full" onClick={onReset}>
          Reset filters
        </Button>
      </CardContent>
    </Card>
  );
}
