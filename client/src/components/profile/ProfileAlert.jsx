export function ProfileAlert({ message, error, onDismiss }) {
  if (!message && !error) return null;

  return (
    <div
      className={`mb-6 rounded-md border p-3 text-sm ${
        error
          ? 'border-destructive/30 bg-destructive/5 text-destructive'
          : 'border-success/30 bg-success/5 text-success'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{error || message}</span>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
