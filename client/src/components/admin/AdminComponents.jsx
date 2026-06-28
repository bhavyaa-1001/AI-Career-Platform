import { motion } from 'framer-motion';

export function AdminPageHeader({ title, description, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
}

export function AdminStatGrid({ stats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
          {s.sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}

export function AdminTable({ columns, rows, emptyMessage = 'No data found' }) {
  if (!rows?.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-muted-foreground">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-border last:border-0 hover:bg-muted/30">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminFilters({ children }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card/50 p-4">
      {children}
    </div>
  );
}

export function AdminPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function RoleBadge({ role }) {
  const colors = {
    admin: 'bg-red-500/10 text-red-600 dark:text-red-400',
    sub_admin: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    recruiter: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    student: 'bg-green-500/10 text-green-600 dark:text-green-400',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[role] || 'bg-muted'}`}>
      {role === 'sub_admin' ? 'Sub Admin' : role}
    </span>
  );
}

export function StatusBadge({ status, variant = 'default' }) {
  const colors = {
    active: 'bg-green-500/10 text-green-600',
    inactive: 'bg-gray-500/10 text-gray-600',
    pending: 'bg-yellow-500/10 text-yellow-600',
    approved: 'bg-green-500/10 text-green-600',
    rejected: 'bg-red-500/10 text-red-600',
    suspended: 'bg-orange-500/10 text-orange-600',
    banned: 'bg-red-500/10 text-red-600',
    default: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[variant] || colors.default}`}>
      {status}
    </span>
  );
}
