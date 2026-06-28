import { Badge } from '@/components/ui';

export function StripeTestModeBanner({ className = '' }) {
  return (
    <div className={`rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-800 dark:text-amber-300">
          Stripe Test Mode
        </Badge>
        <span className="text-amber-900 dark:text-amber-200">
          Payments use test cards only — no real charges. Try card <code className="rounded bg-muted px-1">4242 4242 4242 4242</code> with any future expiry and CVC.
        </span>
      </div>
    </div>
  );
}
