import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Field, inputCls } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@abcdevelopers.demo');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { await login(email, password); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="size-10" />
          <div>
            <h1 className="text-lg font-semibold text-slate-50">VaaniQ</h1>
            <p className="text-xs text-slate-400">Conversational Intelligence · Admin</p>
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Email"><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></Field>
          <Field label="Password"><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></Field>
          {error && <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Sign in</Button>
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">Demo workspace for the fictional company ABC Developers. The admin password is set by SEED_ADMIN_PASSWORD (see README).</p>
      </form>
    </div>
  );
}
