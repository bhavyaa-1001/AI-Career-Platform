import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export const Textarea = forwardRef(function Textarea(
  { className, label, error, id, rows = 4, ...props },
  ref,
) {
  const textareaId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
          'placeholder:text-muted-foreground resize-y min-h-[80px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});
