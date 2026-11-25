import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { fmtDay } from '../lib/format';

// Categorical slots validated (dark mode, surface #111723) with the dataviz palette validator.
export const SERIES = { blue: '#3987e5', orange: '#d95926' };
// Sentiment is a status-like polarity: reserved good/critical colours plus neutral grey, always with a text label.
export const SENTIMENT_COLOR = { positive: '#0ca30c', neutral: '#64748b', negative: '#d03b3b' };
const AXIS = { stroke: '#64748b', fontSize: 11 };

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-medium text-slate-200">{fmtDay(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-300">
          <span className="size-2 rounded-full" style={{ background: p.color }} />{p.name}<span className="ml-auto pl-4 tabular-nums text-slate-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Daily counts over 14 days: one shared count axis, legend + crosshair tooltip. */
export function DailyActivityChart({ data }) {
  const series = [['conversations', 'Conversations', SERIES.blue], ['bookings', 'Visits booked', SERIES.orange]];
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs text-slate-400">
        {series.map(([k, name, c]) => <span key={k} className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: c }} />{name}</span>)}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1e2636" vertical={false} />
            <XAxis dataKey="day" tickFormatter={fmtDay} tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
            <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipBox />} cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} />
            {series.map(([k, name, c]) => <Line key={k} type="monotone" dataKey={k} name={name} stroke={c} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#111723' }} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Horizontal bar list for categorical counts: each bar is labelled with its name and value in text
 * (identity never relies on colour), and shows a tooltip on hover via title.
 */
export function BarList({ rows, color = SERIES.blue, colorFor, format = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${format(r.value)}`} className="group">
          <div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{r.label}</span><span className="tabular-nums text-slate-400">{format(r.value)}</span></div>
          <div className="h-2 rounded-full bg-slate-800/70">
            <div className="h-2 rounded-r-[4px] rounded-l-full transition-opacity group-hover:opacity-80" style={{ width: `${(r.value / max) * 100}%`, background: colorFor ? colorFor(r) : color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
