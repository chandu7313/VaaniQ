import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { Async, Badge, Button, Card, DemoTag, EmptyState, Field, PageHeader, STATUS_TONE, SCORE_TONE, Toast, inputCls } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { STATUS_LABEL, fmtDateTime, fmtRupees, fmtSlot, scoreClass, humanize } from '../lib/format';

/** Manual lead entry by staff (goes through the saveLead tool: validated, deduplicated by phone, scored). */
function NewLeadForm({ onCreated, onCancel, notify }) {
  const [f, setF] = useState({ fullName: '', phone: '', bedrooms: '', budgetLakh: '', timelineMonths: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const profile = {
      ...(f.bedrooms ? { bedrooms: Number(f.bedrooms) } : {}),
      ...(f.budgetLakh ? { budgetMax: Math.round(Number(f.budgetLakh) * 1e5) } : {}),
      ...(f.timelineMonths ? { timelineMonths: Number(f.timelineMonths) } : {}),
    };
    const digits = f.phone.replace(/\D/g, '').slice(-10);
    setSaving(true);
    try {
      const r = await api('/leads', { method: 'POST', body: { ...(f.fullName.trim() ? { fullName: f.fullName.trim() } : {}), ...(digits ? { phone: `+91${digits}` } : {}), profile } });
      notify(r.created ? `Lead created (score ${r.score.total})` : 'A lead with this phone already exists: details merged into it');
      onCreated(r.leadId);
    } catch (err) { notify(err.details?.[0]?.message || err.message, 'error'); } finally { setSaving(false); }
  };
  return (
    <Card title="New lead" subtitle="Only enter what the customer actually said; unknown fields score 0." className="mb-4">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Name"><input className={inputCls} value={f.fullName} onChange={set('fullName')} maxLength={80} /></Field>
        <Field label="Mobile (10 digits)"><input className={inputCls} value={f.phone} onChange={set('phone')} inputMode="tel" /></Field>
        <Field label="BHK"><select className={inputCls} value={f.bedrooms} onChange={set('bedrooms')}><option value="">Not stated</option><option value="2">2BHK</option><option value="3">3BHK</option></select></Field>
        <Field label="Budget (₹ lakh)"><input className={inputCls} type="number" min="10" max="5000" value={f.budgetLakh} onChange={set('budgetLakh')} /></Field>
        <Field label="Timeline (months)"><input className={inputCls} type="number" min="1" max="120" value={f.timelineMonths} onChange={set('timelineMonths')} /></Field>
        <div className="flex items-end gap-2"><Button type="submit" loading={saving}>Save</Button><Button variant="ghost" onClick={onCancel}>Cancel</Button></div>
      </form>
    </Card>
  );
}

function LeadDetail({ id, onClose, onChanged, notify }) {
  const state = useApi(`/leads/${id}`);
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const remove = async (l) => {
    if (!window.confirm(`Permanently delete ${l.full_name || 'this lead'}? Their appointments are deleted too; conversations stay without a lead. This cannot be undone.`)) return;
    try { await api(`/leads/${id}`, { method: 'DELETE' }); notify('Lead deleted'); onChanged(); onClose(); } catch (err) { notify(err.message, 'error'); }
  };
  const setStatus = async (status) => {
    setSaving(true);
    try { await api(`/leads/${id}`, { method: 'PATCH', body: { status } }); notify('Lead status updated'); state.reload(); onChanged(); }
    catch (err) { notify(err.message, 'error'); } finally { setSaving(false); }
  };
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-lg overflow-y-auto border-l border-line bg-panel p-6 shadow-2xl scrollbar-thin">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200" aria-label="Close"><X className="size-5" /></button>
      <Async state={state}>
        {(l) => (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2"><h2 className="text-lg font-semibold text-slate-50">{l.full_name || 'Unnamed caller'}</h2>{l.is_demo && <DemoTag />}</div>
              <div className="mt-1 text-xs text-slate-400">{l.phone || 'No phone yet'} · created {fmtDateTime(l.created_at)}</div>
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">Status
                <select className={`${inputCls} w-48 py-1.5`} value={l.status} disabled={saving} onChange={(e) => setStatus(e.target.value)}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            {user?.role === 'admin' && <Button variant="danger" size="sm" onClick={() => remove(l)}>Delete lead</Button>}
            <Card title="Requirements (customer-stated only)">
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {[['Configuration', l.profile.bedrooms && `${l.profile.bedrooms}BHK`], ['Location', l.profile.location], ['Budget', l.profile.budgetMax && fmtRupees(l.profile.budgetMax)], ['Timeline', l.profile.timelineMonths && `${l.profile.timelineMonths} month${l.profile.timelineMonths === 1 ? '' : 's'}`], ['Decision-maker', l.profile.decisionMaker && humanize(l.profile.decisionMaker)], ['Purpose', l.profile.purpose && humanize(l.profile.purpose)]].map(([k, v]) => (
                  <div key={k}><dt className="text-slate-500">{k}</dt><dd className={v ? 'text-slate-200' : 'text-slate-600'}>{v || 'not stated'}</dd></div>
                ))}
              </dl>
            </Card>
            <Card title="Qualification score"><ScoreBreakdown score={l.score_breakdown?.factors ? l.score_breakdown : null} /></Card>
            <Card title={`Appointments (${l.appointments.length})`}>
              {!l.appointments.length ? <p className="text-sm text-slate-500">None</p> : l.appointments.map((a) => <div key={a.id} className="flex justify-between py-1 text-sm"><span>{fmtSlot(a.starts_at)}</span><Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge></div>)}
            </Card>
            <Card title={`Conversations (${l.conversations.length})`}>
              {!l.conversations.length ? <p className="text-sm text-slate-500">None</p> : l.conversations.map((c) => (
                <Link key={c.id} to={`/conversations/${c.id}`} className="flex justify-between py-1 text-sm hover:text-indigo-200"><span>{fmtDateTime(c.started_at)}</span><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge></Link>
              ))}
            </Card>
            {l.summaries[0] && <Card title="Latest call summary"><p className="text-sm text-slate-300">{l.summaries[0].summary.narrative}</p><ul className="mt-2 list-disc pl-4 text-xs text-slate-400">{l.summaries[0].summary.recommendedNextActions.map((a) => <li key={a}>{a}</li>)}</ul></Card>}
          </div>
        )}
      </Async>
    </aside>
  );
}

export default function Leads() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Pipeline links on the dashboard open this page pre-filtered (?status=qualified).
  const [status, setStatus] = useState(params.get('status') || '');
  const [search, setSearch] = useState('');
  const qs = new URLSearchParams({ ...(status && { status }), ...(search.trim() && { search: search.trim() }) }).toString();
  const state = useApi(`/leads${qs ? `?${qs}` : ''}`);
  const { toast, notify, clear } = useToast();
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <PageHeader title="Lead Management" description="Leads are created and updated through the validated saveLead / updateLead tools. Scores are recomputed every turn."
        actions={!adding && <Button onClick={() => setAdding(true)}>Add lead</Button>} />
      {adding && <NewLeadForm notify={notify} onCancel={() => setAdding(false)} onCreated={(leadId) => { setAdding(false); state.reload(); navigate(`/leads/${leadId}`); }} />}
      <div className="mb-4 flex flex-wrap gap-2">
        <input className={`${inputCls} max-w-xs`} placeholder="Search name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inputCls} w-48`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <Card>
        <Async state={state}>
          {(leads) => (!leads.length ? <EmptyState title="No leads match" hint="Run a conversation in the AI Voice Agent to create one." /> : (
            <div className="-m-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-line text-xs text-slate-500"><tr>{['Lead', 'Requirement', 'Budget', 'Timeline', 'Score', 'Status', 'Updated'].map((h) => <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>)}</tr></thead>
                <tbody>{leads.map((l) => (
                  <tr key={l.id} onClick={() => navigate(`/leads/${l.id}`)} className="cursor-pointer border-b border-line/60 hover:bg-panel-2">
                    <td className="px-5 py-3"><div className="flex items-center gap-2 font-medium text-slate-100">{l.full_name || 'Unnamed caller'}{l.is_demo && <DemoTag />}</div><div className="text-xs text-slate-500">{l.phone || '—'}</div></td>
                    <td className="px-5 py-3 text-slate-300">{[l.profile.bedrooms && `${l.profile.bedrooms}BHK`, l.profile.location].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="px-5 py-3 text-slate-300">{fmtRupees(l.profile.budgetMax)}</td>
                    <td className="px-5 py-3 text-slate-300">{l.profile.timelineMonths ? `${l.profile.timelineMonths} mo` : '—'}</td>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><span className="w-7 tabular-nums font-medium text-slate-100">{l.score}</span><Badge tone={SCORE_TONE[scoreClass(l.score)]}>{scoreClass(l.score)}</Badge></div></td>
                    <td className="px-5 py-3"><Badge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge></td>
                    <td className="px-5 py-3 text-xs text-slate-500">{fmtDateTime(l.updated_at)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ))}
        </Async>
      </Card>
      {id && <><div className="fixed inset-0 z-30 bg-black/50" onClick={() => navigate('/leads')} /><LeadDetail id={id} onClose={() => navigate('/leads')} onChanged={state.reload} notify={notify} /></>}
      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
