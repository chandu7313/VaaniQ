import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight } from 'lucide-react';
import { Badge, Card, DemoTag, SENTIMENT_TONE, STATUS_TONE } from '../ui';
import ScoreBreakdown from '../ScoreBreakdown';
import TraceView from '../TraceView';
import AppointmentStatus from './AppointmentStatus';
import { STATUS_LABEL, fmtRupees, humanize } from '../../lib/format';

const PROFILE_FIELDS = [
  ['bedrooms', 'Configuration', (v) => `${v}BHK`], ['location', 'Location'], ['budgetMax', 'Budget', fmtRupees],
  ['timelineMonths', 'Timeline', (v) => `${v} month${v === 1 ? '' : 's'}`], ['decisionMaker', 'Decision', humanize], ['purpose', 'Purpose', humanize],
  ['preferences', 'Preferences', (v) => v.join(', ')], ['visitIntent', 'Visit', humanize],
];

/** Live view of what the agent has learned and done: CRM record, score, sentiment trend, last decision trace. */
export default function InsightsPanel({ result, sentiments, conversationId }) {
  const lead = result?.lead;
  return (
    <div className="space-y-4">
      <Card title="Lead record (CRM)" action={lead && <div className="flex gap-1.5">{lead.is_demo && <DemoTag />}<Badge tone={STATUS_TONE[lead.status]}>{STATUS_LABEL[lead.status]}</Badge></div>}>
        {!lead ? <p className="text-sm text-slate-500">Extracted requirements will appear here as the customer speaks. Nothing is filled in unless the customer says it.</p> : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="col-span-2 text-sm font-medium text-slate-100">{lead.full_name || 'Unnamed caller'}</div>
            {PROFILE_FIELDS.map(([k, label, f]) => (
              <div key={k}><div className="text-slate-500">{label}</div><div className={lead.profile?.[k] !== undefined ? 'text-slate-200' : 'text-slate-600'}>{lead.profile?.[k] !== undefined ? (f ? f(lead.profile[k]) : lead.profile[k]) : 'not stated'}</div></div>
            ))}
            <div className="col-span-2 pt-1"><Link className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200" to={`/leads/${lead.id}`}>Open in Lead Management <ArrowUpRight className="size-3" /></Link></div>
          </div>
        )}
      </Card>
      <AppointmentStatus result={result} />
      <Card title="Lead qualification score" subtitle="Budget 25 · Requirements 25 · Timeline 20 · Authority 15 · Appointment 15">
        <ScoreBreakdown score={result?.score} />
      </Card>
      <Card title="Sentiment across the conversation" subtitle="Classified from the transcript text, not from voice tone or acoustic emotion">
        {!sentiments.length ? <p className="text-sm text-slate-500">No customer messages yet.</p> : (
          <div className="flex flex-wrap items-center gap-1.5">
            {sentiments.map((s, i) => <Badge key={i} tone={SENTIMENT_TONE[s.label]} title={s.evidence?.map((e) => e.phrase).join(', ') || 'no cues'}>T{i + 1} {s.label}</Badge>)}
          </div>
        )}
      </Card>
      <Card title="Latest agent decision trace" action={conversationId && <Link to={`/traces?conversationId=${conversationId}`} className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200"><Activity className="size-3.5" />All turns</Link>}>
        {result?.trace ? <TraceView trace={result.trace} /> : <p className="text-sm text-slate-500">After each turn you will see the detected intent, retrieved documents, action proposals, validated tool calls and the outcome.</p>}
      </Card>
    </div>
  );
}
