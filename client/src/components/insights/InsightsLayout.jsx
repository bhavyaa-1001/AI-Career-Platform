import { Button, Input } from '@/components/ui';
import { toDateInput } from '@/components/insights/chartTheme';

export function InsightsFilters({
  from, to, onFromChange, onToChange, onApply, onReset, onExportCsv, onExportPdf, isExporting,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card/50 p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
        <Input
          type="date"
          value={toDateInput(from)}
          onChange={(e) => onFromChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
          className="w-40"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="date"
          value={toDateInput(to)}
          onChange={(e) => {
            if (!e.target.value) return onToChange('');
            const d = new Date(e.target.value);
            d.setHours(23, 59, 59, 999);
            onToChange(d.toISOString());
          }}
          className="w-40"
        />
      </div>
      <Button variant="secondary" size="sm" onClick={onApply}>Apply</Button>
      <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={onExportCsv} disabled={isExporting}>Export CSV</Button>
        <Button variant="outline" size="sm" onClick={onExportPdf} disabled={isExporting}>Export PDF</Button>
      </div>
    </div>
  );
}

export function InsightsSection({ title, description, children, className = '' }) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function StatGrid({ stats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
          {s.hint && <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}
