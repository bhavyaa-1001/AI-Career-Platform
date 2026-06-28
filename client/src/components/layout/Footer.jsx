export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Career Platform. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">Milestone 1 — Project Foundation</p>
      </div>
    </footer>
  );
}
