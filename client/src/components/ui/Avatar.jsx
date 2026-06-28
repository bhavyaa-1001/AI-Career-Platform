import { cn } from '@/lib/utils';

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-24 w-24 text-3xl' };

export function Avatar({ src, name, size = 'md', className }) {
  const initial = name?.[0]?.toUpperCase() || '?';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-border',
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
