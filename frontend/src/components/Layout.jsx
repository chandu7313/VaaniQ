import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Mic,
  Users,
  CalendarDays,
  BookOpen,
  MessagesSquare,
  BarChart3,
  Workflow,
  LogOut,
  Menu,
  X,
  Settings,
  Search,
  Bell,
  ChevronRight,
  Building2,
  ChevronsUpDown,
  FlaskConical,
  Sparkles,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../lib/api';
import { cx, Spinner, Badge } from './ui';
import { ProductBrand } from './ProductBrand';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      ['/', 'Overview', LayoutDashboard],
      ['/agent', 'AI Voice Agent', Mic],
    ],
  },
  {
    label: 'Revenue & CRM',
    items: [
      ['/leads', 'Leads & CRM', Users],
      ['/appointments', 'Appointments', CalendarDays],
      ['/conversations', 'Conversations', MessagesSquare],
    ],
  },
  {
    label: 'Intelligence',
    items: [
      ['/knowledge', 'Knowledge Base', BookOpen],
      ['/traces', 'Agent Intelligence', Workflow],
      ['/intelligence', 'Analytics', BarChart3],
    ],
  },
  {
    label: 'System',
    items: [['/settings', 'Settings', Settings]],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);

function getBreadcrumb(pathname) {
  const match = ALL_NAV.find(([to]) => (to === '/' ? pathname === '/' : pathname.startsWith(to)));
  const label = match ? match[1] : 'Overview';
  const parts = pathname.split('/').filter(Boolean);
  const hasDetail = parts.length > 1;
  return { label, parentTo: match?.[0] || '/', hasDetail };
}

function initials(name) {
  if (!name) return 'VQ';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export default function Layout() {
  const { user, meta, logout } = useAuth();
  const { settings, update } = useSettings();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [leadHits, setLeadHits] = useState([]);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const crumb = getBreadcrumb(location.pathname);
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    const onDocClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setLeadHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const rows = await api(`/leads?search=${encodeURIComponent(trimmed)}`);
        if (!cancelled) setLeadHits(Array.isArray(rows) ? rows.slice(0, 5) : []);
      } catch {
        if (!cancelled) setLeadHits([]);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const routeHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_NAV.filter(([, label]) => label.toLowerCase().includes(q));
  }, [query]);

  const jumpTo = (to) => {
    setQuery('');
    setSearchOpen(false);
    navigate(to);
  };

  return (
    <div className="flex h-full bg-canvas text-ink">
      {/* Modern Dark Forest-Charcoal Navigation Sidebar */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-rail-border bg-rail text-rail-ink transition-all duration-200 lg:static lg:translate-x-0',
          collapsed ? 'w-72 lg:w-[78px]' : 'w-72',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Top Brand + Collapse Control */}
        <div
          className={cx(
            'flex h-16 shrink-0 items-center border-b border-rail-border px-4',
            collapsed ? 'lg:justify-center lg:px-2' : 'justify-between',
          )}
        >
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="rounded-md focus-visible:outline-none"
            title="VaaniQ Overview"
          >
            <ProductBrand size="md" surface="dark" compact={collapsed} />
          </Link>

          <button
            type="button"
            className="hidden cursor-pointer rounded-lg p-1.5 text-rail-muted transition-colors hover:bg-rail-2 hover:text-rail-ink lg:inline-flex"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
          </button>

          <button
            type="button"
            className="cursor-pointer rounded-lg p-1.5 text-rail-muted hover:bg-rail-2 hover:text-rail-ink lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Workspace Switcher & Quick Call Action */}
        <div className={cx('space-y-2.5 border-b border-rail-border p-3.5', collapsed && 'lg:px-2.5')}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setWorkspaceOpen((v) => !v)}
              title={user?.tenant_name || meta?.tenant?.name || 'Workspace'}
              className={cx(
                'flex w-full cursor-pointer items-center gap-3 rounded-xl border border-rail-border bg-rail-2 px-3 py-2.5 text-left transition-colors hover:border-[#3E5849]',
                collapsed && 'lg:justify-center lg:px-2',
              )}
              aria-expanded={workspaceOpen}
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#244D3C] text-[#DCE9DD]">
                <Building2 className="size-4" />
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-rail-ink">
                      {user?.tenant_name || meta?.tenant?.name || 'Workspace'}
                    </div>
                    <div className="truncate font-mono text-[11px] text-rail-muted">
                      {meta?.demoMode ? 'DEMO_MODE · Rule-based' : `LLM · ${meta?.provider || 'Live'}`}
                    </div>
                  </div>
                  <ChevronsUpDown className="size-4 shrink-0 text-rail-muted" />
                </>
              )}
            </button>

            {workspaceOpen && !collapsed && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-rail-border bg-rail-2 p-3.5 text-[13px] text-rail-ink shadow-[var(--shadow-popover)]">
                <div className="font-semibold">{meta?.tenant?.name || user?.tenant_name}</div>
                <div className="mt-1 leading-relaxed text-rail-muted">
                  {meta?.tenant?.isDemo
                    ? 'Active demo workspace with seeded real-estate inventory and historical transcripts.'
                    : 'Production sales workspace.'}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-rail-border pt-2.5">
                  <Link
                    to="/demo/abc-developers"
                    onClick={() => {
                      setWorkspaceOpen(false);
                      setOpen(false);
                    }}
                    className="font-medium text-terra hover:underline"
                  >
                    Customer demo ↗
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => {
                      setWorkspaceOpen(false);
                      setOpen(false);
                    }}
                    className="font-medium text-[#9FD1B1] hover:underline"
                  >
                    Config →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/agent"
            onClick={() => setOpen(false)}
            title="Start AI Voice Call"
            className={cx(
              'flex w-full items-center justify-center gap-2 rounded-xl bg-terra px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95',
              collapsed && 'lg:px-2',
            )}
          >
            <PhoneCall className="size-4 shrink-0" />
            {!collapsed && <span>Launch Voice Call</span>}
          </Link>
        </div>

        {/* Grouped Navigation */}
        <nav
          className={cx('scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3.5 py-5', collapsed && 'lg:px-2.5')}
          aria-label="Main navigation"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed ? (
                <div className="mb-2 px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-rail-muted">
                  {group.label}
                </div>
              ) : (
                <div className="mb-2 hidden border-t border-rail-border/60 lg:block" />
              )}
              <div className="space-y-1">
                {group.items.map(([to, label, Icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setOpen(false)}
                    title={label}
                    className={({ isActive }) =>
                      cx(
                        'group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[14.5px] transition-all',
                        collapsed && 'lg:justify-center lg:px-2',
                        isActive
                          ? 'border-[#386650] bg-[#244D3C] font-medium text-white shadow-sm'
                          : 'border-transparent text-rail-muted hover:bg-rail-2 hover:text-rail-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-terra" />
                        )}
                        <Icon
                          className={cx(
                            'size-[18px] shrink-0 transition-colors',
                            isActive ? 'text-[#DCE9DD]' : 'text-rail-muted group-hover:text-rail-ink',
                          )}
                        />
                        {!collapsed && <span className="truncate">{label}</span>}
                        {isActive && !collapsed && (
                          <span className="ml-auto size-1.5 rounded-full bg-[#8CE0B0]" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={cx('border-t border-rail-border p-3.5', collapsed && 'lg:px-2.5')}>
          <div
            className={cx(
              'flex items-center gap-3 rounded-xl bg-rail-2/60 px-3 py-2.5',
              collapsed && 'lg:justify-center lg:px-2',
            )}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#244D3C] text-xs font-semibold text-white ring-1 ring-[#3D6F59]">
              {initials(user?.full_name)}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-rail-ink">{user?.full_name}</div>
                  <div className="truncate font-mono text-[11px] uppercase text-rail-muted">{user?.role}</div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="cursor-pointer rounded-lg p-1.5 text-rail-muted transition-colors hover:bg-rail-2 hover:text-rail-ink"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Modern 64px Top Navigation Bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-line bg-surface px-4 lg:px-8">
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-ink-2 hover:bg-section hover:text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm sm:flex">
            <span className="font-medium text-ink-muted">{user?.tenant_name || 'Workspace'}</span>
            <ChevronRight className="size-4 text-ink-muted" />
            <Link
              to={crumb.parentTo}
              className={cx(
                'font-medium transition-colors',
                crumb.hasDetail ? 'text-ink-2 hover:text-ink' : 'text-ink',
              )}
            >
              {crumb.label}
            </Link>
            {crumb.hasDetail && (
              <>
                <ChevronRight className="size-4 text-ink-muted" />
                <span className="font-medium text-ink">Record</span>
              </>
            )}
          </nav>

          {/* Quick Search */}
          <div ref={searchRef} className="relative ml-auto w-full max-w-sm sm:ml-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search leads or jump to screen…"
              aria-label="Search leads or jump to screen"
              className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {searchOpen && query.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-[var(--shadow-popover)]">
                {routeHits.length > 0 && (
                  <div className="mb-1.5">
                    <div className="px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      Navigation
                    </div>
                    {routeHits.map(([to, label, Icon]) => (
                      <button
                        key={to}
                        type="button"
                        onClick={() => jumpTo(to)}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-2"
                      >
                        <Icon className="size-4 text-brand" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {leadHits.length > 0 && (
                  <div>
                    <div className="px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      Leads
                    </div>
                    {leadHits.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => jumpTo(`/leads/${l.id}`)}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-2"
                      >
                        <span className="truncate font-medium">{l.full_name || 'Unnamed caller'}</span>
                        <span className="shrink-0 font-mono text-xs text-ink-muted">
                          {l.phone || `score ${l.score}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {routeHits.length === 0 && leadHits.length === 0 && (
                  <div className="px-3 py-2.5 text-sm text-ink-muted">No matching pages or leads.</div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls: Mode Badge, Light/Dark Toggle, Notifications, Profile */}
          <div className="flex items-center gap-2.5 sm:ml-auto">
            {meta &&
              (meta.demoMode ? (
                <Badge
                  tone="dark"
                  title="No LLM API key configured: rule-based NLU and extractive answers from the knowledge base"
                >
                  <FlaskConical className="size-3.5 text-terra" />
                  <span className="font-mono">DEMO_MODE</span>
                  <span className="hidden xl:inline text-rail-muted">· rule-based</span>
                </Badge>
              ) : (
                <Badge tone="green">
                  <Sparkles className="size-3.5" />
                  <span className="font-mono">LLM · {meta.provider}</span>
                </Badge>
              ))}

            <button
              type="button"
              onClick={() => update({ theme: isDark ? 'light' : 'dark' })}
              title={isDark ? 'Switch to Light + Dark contrast theme' : 'Switch to Dark theme'}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-section"
            >
              {isDark ? <Sun className="size-4 text-terra" /> : <Moon className="size-4 text-ink" />}
              <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Workspace notices"
                className="relative cursor-pointer rounded-lg border border-line bg-surface p-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Bell className="size-4" />
                {meta?.tenant?.isDemo && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-terra" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-84 rounded-xl border border-line bg-surface p-4 text-[13px] shadow-[var(--shadow-popover)]">
                  <div className="text-sm font-semibold text-ink">Workspace Notices</div>
                  <div className="mt-2.5 space-y-2.5">
                    <div className="rounded-lg border border-warning-border bg-warning-soft p-3 text-warning">
                      <span className="font-semibold">Fictional demonstration dataset:</span> ABC Developers, property inventory, prices, and customer records are seeded for evaluation.
                    </div>
                    <div className="rounded-lg border border-line bg-canvas p-3 text-ink-2">
                      Engine mode:{' '}
                      <span className="font-medium text-ink">
                        {meta?.demoMode ? 'Rule-based deterministic NLU & BM25 RAG' : `Live LLM (${meta?.provider})`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="User menu"
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface py-1.5 pl-2 pr-3 text-[13px] transition-colors hover:bg-surface-2"
              >
                <span className="grid size-7 place-items-center rounded-full bg-rail text-xs font-semibold text-rail-ink">
                  {initials(user?.full_name)}
                </span>
                <span className="hidden font-medium text-ink md:inline">{user?.full_name}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-line bg-surface p-2 text-[13px] shadow-[var(--shadow-popover)]">
                  <div className="border-b border-line px-2.5 py-2.5">
                    <div className="text-sm font-semibold text-ink">{user?.full_name}</div>
                    <div className="truncate text-xs text-ink-2">{user?.email}</div>
                    <div className="mt-1.5">
                      <Badge tone="brand">{user?.role}</Badge>
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-ink hover:bg-surface-2"
                    >
                      <Settings className="size-4 text-ink-2" />
                      Settings &amp; Voice
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-danger hover:bg-danger-soft"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main View */}
        <main className="scrollbar-thin flex-1 overflow-y-auto px-5 py-7 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-[1440px]">
            <Suspense fallback={<Spinner />}>
              <div key={location.pathname} className="vq-fade-in">
                <Outlet />
              </div>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
