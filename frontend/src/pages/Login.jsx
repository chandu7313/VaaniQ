import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, ShieldCheck, Globe2, CalendarCheck, Sun, Moon, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Button, Field, inputCls, Badge } from '../components/ui';
import { ProductBrand } from '../components/ProductBrand';

export default function Login() {
  const { login } = useAuth();
  const { settings, update } = useSettings();
  const [email, setEmail] = useState('admin@abcdevelopers.demo');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const isDark = settings.theme === 'dark';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-full bg-canvas">
      <button
        type="button"
        onClick={() => update({ theme: isDark ? 'light' : 'dark' })}
        className="absolute right-6 top-6 flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink shadow-[var(--shadow-card)] hover:bg-surface-2"
      >
        {isDark ? <Sun className="size-4 text-terra" /> : <Moon className="size-4 text-ink" />}
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
      </button>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 py-14 lg:flex-row lg:gap-16">
        <div className="max-w-md space-y-6">
          <ProductBrand size="lg" />
          <div>
            <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight text-ink sm:text-[38px]">
              Autonomous multilingual sales operations, built on verified facts.
            </h1>
            <p className="mt-3.5 text-[15px] leading-relaxed text-ink-2">
              Conduct voice and text customer conversations across English, Hindi, and Telugu with live RAG retrieval, explainable lead scoring, and consent-gated appointment booking.
            </p>
          </div>
          <div className="space-y-3.5 border-t border-line pt-6 text-sm text-ink-2">
            <div className="flex items-start gap-3">
              <Globe2 className="mt-0.5 size-4.5 shrink-0 text-brand" />
              <span>Multilingual customer qualification with instant transcript sentiment analysis.</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-brand" />
              <span>Auditable decision traces and BM25 document citations for every agent reply.</span>
            </div>
            <div className="flex items-start gap-3">
              <CalendarCheck className="mt-0.5 size-4.5 shrink-0 text-brand" />
              <span>Real-time PostgreSQL CRM synchronization and double-book-safe site visit scheduling.</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-[var(--shadow-popover)]"
        >
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Sign in to workspace</h2>
              <p className="mt-0.5 text-[13px] text-ink-2">ABC Developers · Demo Environment</p>
            </div>
            <Badge tone="dark">
              <LockKeyhole className="size-3.5 text-terra" />
              Admin
            </Badge>
          </div>

          <div className="space-y-4">
            <Field label="Work email">
              <input
                className={inputCls}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Password">
              <input
                className={inputCls}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter workspace password"
                required
              />
            </Field>
            {error && (
              <p role="alert" className="rounded-lg border border-danger-border bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </div>

          <p className="mt-6 border-t border-line pt-4 text-center text-xs leading-relaxed text-ink-muted">
            Demo workspace for the fictional company ABC Developers. The admin password is configured by{' '}
            <code className="font-mono text-ink-2">SEED_ADMIN_PASSWORD</code>.
          </p>

          <div className="mt-4 text-center">
            <Link
              to="/demo/abc-developers"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
            >
              <span>Open Public Customer Experience Demo</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
