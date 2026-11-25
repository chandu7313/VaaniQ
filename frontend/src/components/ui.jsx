import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

export const cx = (...c) => c.filter(Boolean).join(' ');

export function Card({ className, bodyClassName, children, title, action, subtitle, padded = true }) {
  return (
    <section
      className={cx(
        'min-w-0 rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-[13px] leading-snug text-ink-2">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cx(padded && 'p-6', bodyClassName)}>{children}</div>
    </section>
  );
}

const BTN = {
  primary:
    'bg-rail text-rail-ink hover:bg-brand-deep dark:bg-brand dark:text-white dark:hover:opacity-90 disabled:opacity-45 shadow-[0_1px_2px_rgba(22,34,28,0.18)]',
  secondary:
    'border border-line-strong bg-surface text-ink hover:bg-surface-2 disabled:opacity-50',
  danger:
    'border border-danger-border bg-danger-soft text-danger hover:opacity-90 disabled:opacity-50',
  ghost: 'text-ink-2 hover:bg-section hover:text-ink disabled:opacity-50',
};

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed',
        size === 'sm' ? 'px-3 py-1.5 text-[13px]' : 'px-4 py-2.5 text-sm',
        BTN[variant],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

const TONES = {
  slate: 'bg-section text-ink-2 border-line',
  indigo: 'bg-brand-soft text-brand-deep border-brand-soft-border',
  brand: 'bg-brand-soft text-brand-deep border-brand-soft-border',
  green: 'bg-success-soft text-success border-success-border',
  amber: 'bg-warning-soft text-warning border-warning-border',
  red: 'bg-danger-soft text-danger border-danger-border',
  sky: 'bg-info-soft text-info border-info-border',
  dark: 'bg-rail text-rail-ink border-rail-border',
};

export const Badge = ({ tone = 'slate', className, children, title }) => (
  <span
    title={title}
    className={cx(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium leading-tight',
      TONES[tone] || TONES.slate,
      className,
    )}
  >
    {children}
  </span>
);

export const STATUS_TONE = {
  new: 'slate',
  contacted: 'sky',
  qualified: 'brand',
  visit_scheduled: 'green',
  nurture: 'amber',
  lost: 'red',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'brand',
  no_show: 'amber',
  active: 'sky',
  ended: 'slate',
  escalated: 'red',
};

export const SENTIMENT_TONE = { positive: 'green', neutral: 'slate', negative: 'red' };
export const SCORE_TONE = { hot: 'red', warm: 'amber', cold: 'sky' };

export const DemoTag = () => (
  <Badge tone="amber" className="font-mono text-[11px] tracking-wider" title="Fictional demonstration data">
    DEMO
  </Badge>
);

export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between text-[13px] font-medium text-ink-2">
        <span>{label}</span>
        {Icon && <Icon className="size-4 text-ink-muted" />}
      </div>
      <div className="mt-2.5 font-mono text-[28px] font-semibold leading-none tracking-tight text-ink tabular-nums">
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}

/** Unified horizontal metric strip combining a dark anchor cell + crisp light cells. */
export function KpiStrip({ items }) {
  return (
    <div className="grid grid-cols-2 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)] sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-y-0">
      {items.map(({ label, value, hint, icon: Icon, accent, dark }) => (
        <div
          key={label}
          className={cx(
            'flex flex-col justify-between px-5 py-4.5 transition-colors',
            dark ? 'bg-rail text-rail-ink' : 'hover:bg-canvas/60',
          )}
        >
          <div
            className={cx(
              'flex items-center justify-between gap-2 text-[13px] font-medium',
              dark ? 'text-rail-muted' : 'text-ink-2',
            )}
          >
            <span className="truncate">{label}</span>
            {Icon && (
              <Icon className={cx('size-4 shrink-0', dark ? 'text-terra' : 'text-ink-muted')} />
            )}
          </div>
          <div
            className={cx(
              'mt-3 font-mono text-[28px] font-semibold leading-none tracking-tight tabular-nums',
              dark ? 'text-rail-ink' : accent || 'text-ink',
            )}
          >
            {value}
          </div>
          {hint && (
            <div className={cx('mt-2 truncate text-xs', dark ? 'text-rail-muted' : 'text-ink-muted')}>
              {hint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2.5 py-14 text-[15px] text-ink-2">
    <Loader2 className="size-5 animate-spin text-brand" />
    <span>{label}</span>
  </div>
);

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-danger-border bg-danger-soft px-5 py-8 text-center text-sm text-danger">
      <AlertTriangle className="size-6 text-danger" />
      <div className="max-w-md">{error?.message || 'Something went wrong'}</div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export const EmptyState = ({ title, hint, icon: Icon = Inbox, action }) => (
  <div className="flex flex-col items-center gap-2.5 py-12 text-center">
    <div className="grid size-12 place-items-center rounded-xl border border-line bg-surface-2 text-ink-muted">
      <Icon className="size-6" />
    </div>
    <div className="mt-1 text-base font-medium text-ink">{title}</div>
    {hint && <div className="max-w-md text-sm leading-relaxed text-ink-2">{hint}</div>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

/** Renders loading / error / empty states uniformly around a data block. */
export function Async({ state, empty, children }) {
  if (state.loading && !state.data) return <Spinner />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  if (empty && empty(state.data)) return null;
  return children(state.data);
}

export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
    <div className="min-w-0 max-w-3xl">
      {eyebrow && (
        <div className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-brand">
          {eyebrow}
        </div>
      )}
      <h1 className="font-serif text-[30px] font-medium leading-tight tracking-tight text-ink sm:text-[36px]">
        {title}
      </h1>
      {description && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
  </div>
);

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span>
    {children}
    {hint && <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>}
  </label>
);

export const inputCls =
  'w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-surface-2 disabled:text-ink-muted';

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      role="status"
      className={cx(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm shadow-[var(--shadow-popover)]',
        isError
          ? 'border-danger-border bg-danger-soft text-danger'
          : 'border-rail-border bg-rail text-rail-ink',
      )}
    >
      <span className={cx('size-2.5 shrink-0 rounded-full', isError ? 'bg-danger' : 'bg-[#6ED499]')} />
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 cursor-pointer text-[13px] font-medium opacity-80 underline-offset-2 hover:opacity-100 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}
