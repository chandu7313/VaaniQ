import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

export const cx = (...c) => c.filter(Boolean).join(' ');

export function Card({ className, children, title, action, subtitle }) {
  return (
    <section className={cx('min-w-0 rounded-xl border border-line bg-panel', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const BTN = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-400 disabled:bg-indigo-500/40',
  secondary: 'border border-line bg-panel-2 text-slate-200 hover:bg-slate-800 disabled:opacity-50',
  danger: 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50',
  ghost: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50',
};
export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed', size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm', BTN[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

const TONES = {
  slate: 'bg-slate-500/15 text-slate-300 ring-slate-500/25',
  indigo: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/25',
  green: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/25',
  red: 'bg-rose-500/15 text-rose-300 ring-rose-500/25',
  sky: 'bg-sky-500/15 text-sky-300 ring-sky-500/25',
};
export const Badge = ({ tone = 'slate', className, children, title }) => (
  <span title={title} className={cx('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap', TONES[tone], className)}>{children}</span>
);

export const STATUS_TONE = { new: 'slate', contacted: 'sky', qualified: 'indigo', visit_scheduled: 'green', nurture: 'amber', lost: 'red', confirmed: 'green', cancelled: 'red', completed: 'indigo', no_show: 'amber', active: 'sky', ended: 'slate', escalated: 'red' };
export const SENTIMENT_TONE = { positive: 'green', neutral: 'slate', negative: 'red' };
export const SCORE_TONE = { hot: 'red', warm: 'amber', cold: 'sky' };

export const DemoTag = () => <Badge tone="amber" title="Fictional demonstration data">DEMO</Badge>;

export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
        {label}
        {Icon && <Icon className="size-4 text-slate-500" />}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400"><Loader2 className="size-4 animate-spin" />{label}</div>
);

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-8 text-center text-sm text-rose-200">
      <AlertTriangle className="size-5 text-rose-400" />
      <div>{error?.message || 'Something went wrong'}</div>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export const EmptyState = ({ title, hint, icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center gap-2 py-10 text-center">
    <Icon className="size-6 text-slate-600" />
    <div className="text-sm font-medium text-slate-300">{title}</div>
    {hint && <div className="max-w-sm text-xs text-slate-500">{hint}</div>}
  </div>
);

/** Renders loading / error / empty states uniformly around a data block. */
export function Async({ state, empty, children }) {
  if (state.loading && !state.data) return <Spinner />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  if (empty && empty(state.data)) return null;
  return children(state.data);
}

export const PageHeader = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-50">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);
export const inputCls = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div role="status" className={cx('fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl', toast.type === 'error' ? 'border-rose-500/30 bg-rose-950 text-rose-100' : 'border-emerald-500/30 bg-emerald-950 text-emerald-100')}>
      {toast.message}
      <button type="button" onClick={onClose} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
    </div>
  );
}
