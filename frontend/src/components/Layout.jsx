import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Suspense, useState } from 'react';
import { LayoutDashboard, Mic, Users, CalendarDays, BookOpen, MessagesSquare, BarChart3, Workflow, LogOut, Menu, X, FlaskConical, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cx, Spinner } from './ui';

const NAV = [
  ['/', 'Executive Dashboard', LayoutDashboard],
  ['/agent', 'AI Voice Agent', Mic],
  ['/leads', 'Leads', Users],
  ['/appointments', 'Appointments', CalendarDays],
  ['/knowledge', 'Knowledge Base', BookOpen],
  ['/conversations', 'Conversations', MessagesSquare],
  ['/intelligence', 'Call Intelligence', BarChart3],
  ['/traces', 'Agent Decision Trace', Workflow],
  ['/settings', 'Settings & Language', Settings],
];

export default function Layout() {
  const { user, meta, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="flex h-full">
      <aside className={cx('fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-panel transition-transform lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center gap-2.5 px-5 py-5">
          <img src="/favicon.svg" alt="" className="size-8" />
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-slate-50">VaaniQ</div>
            <div className="text-[11px] text-slate-500">Conversational Intelligence</div>
          </div>
          <button type="button" className="ml-auto text-slate-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
              className={({ isActive }) => cx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors', isActive ? 'bg-indigo-500/15 font-medium text-indigo-200' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200')}>
              <Icon className="size-4" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <div className="truncate text-sm text-slate-200">{user?.full_name}</div>
          <div className="truncate text-xs text-slate-500">{user?.tenant_name}</div>
          <button type="button" onClick={logout} className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"><LogOut className="size-3.5" />Sign out</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-panel/60 px-4 py-2.5 backdrop-blur lg:px-8">
          <button type="button" className="text-slate-400 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <FlaskConical className="size-3.5 text-amber-400" />
            <span><span className="font-medium text-amber-300">Fictional demo data</span><span className="hidden md:inline">: ABC Developers, its inventory, prices and customers are not real.</span></span>
          </div>
          <div className="ml-auto">
            {meta && (meta.demoMode
              ? <span className="rounded-md bg-amber-500/15 whitespace-nowrap px-2 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-500/30" title="No LLM API key configured: rule-based NLU and extractive answers from the knowledge base">DEMO_MODE<span className="hidden sm:inline"> · rule-based AI</span></span>
              : <span className="rounded-md bg-emerald-500/15 whitespace-nowrap px-2 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/30">LLM · {meta.provider}</span>)}
          </div>
        </header>
        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 lg:px-8"><Suspense fallback={<Spinner />}><div key={location.pathname} className="vq-fade-in"><Outlet /></div></Suspense></main>
      </div>
    </div>
  );
}
