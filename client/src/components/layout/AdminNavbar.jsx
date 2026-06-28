import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ThemeToggle } from '@/components/common';
import { Badge, Button } from '@/components/ui';
import { setSidebarOpen } from '@/features/admin/adminSlice';
import { useAuth } from '@/hooks/useAuth';

export function AdminNavbar({ title }) {
  const dispatch = useDispatch();
  const { user, logout, isSubAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        className="rounded-lg p-2 hover:bg-accent lg:hidden"
        onClick={() => dispatch(setSidebarOpen(true))}
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex flex-1 items-center gap-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        <Badge variant={isSubAdmin ? 'secondary' : 'destructive'} className="hidden sm:inline-flex">
          {isSubAdmin ? 'Sub Admin' : 'Admin'}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">Exit Admin</Button>
        </Link>
        <ThemeToggle />
        <span className="hidden text-sm text-muted-foreground sm:inline">{user?.firstName}</span>
        <Button variant="outline" size="sm" onClick={() => logout()}>Logout</Button>
      </div>
    </header>
  );
}
