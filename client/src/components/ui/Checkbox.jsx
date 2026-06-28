import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export const Checkbox = forwardRef(function Checkbox({ className, label, id, ...props }, ref) {
  const checkboxId = id || props.name;

  return (
    <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={cn(
          'h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className,
        )}
        {...props}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </label>
  );
});
