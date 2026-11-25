import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { fmtDay } from '../lib/format';
import { useSettings } from '../context/SettingsContext';

export const SERIES = {
  green: '#244D3C',
  greenDark: '#5DAE84',
  terra: '#C77B5B',
  terraDark: '#DF9272',
  olive: '#82966B',
  blue: '#244D3C',
  orange: '#C77B5B',
};

export const SENTIMENT_COLOR = {
  positive: '#2C6E49',
  neutral: '#899188',
  negative: '#A93B3B',
};

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] shadow-[var(--shadow-popover)]">
      <div className="mb-1.5 border-b border-line pb-1 font-medium text-ink">{fmtDay(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2.5 py-0.5 text-ink-2">
          <span className="size-2.5 rounded-full" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-4 font-mono font-semibold tabular-nums text-ink">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Daily counts over 14 days: shared count axis, crisp legend + crosshair tooltip. Adapts cleanly to Light & Dark modes. */
export function DailyActivityChart({ data }) {
  const settingsCtx = useSettings();
  const isDark = settingsCtx?.settings?.theme === 'dark';

  const convColor = isDark ? SERIES.greenDark : SERIES.green;
  const bookColor = isDark ? SERIES.terraDark : SERIES.terra;
  const gridColor = isDark ? '#27382F' : '#EAECE4';
  const axisLineColor = isDark ? '#354A3F' : '#E2E4DC';
  const tickColor = isDark ? '#93A59A' : '#657168';
  const dotStroke = isDark ? '#151F1A' : '#FFFFFF';

  const axisStyle = { stroke: tickColor, fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' };
  const series = [
    ['conversations', 'Conversations', convColor],
    ['bookings', 'Visits booked', bookColor],
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-6 text-[13px] text-ink-2">
        {series.map(([k, name, c]) => (
          <span key={k} className="flex items-center gap-2 font-medium">
            <span className="h-1 w-4 rounded-full" style={{ background: c }} />
            {name}
          </span>
        ))}
      </div>
      <div className="h-68">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="vqConvFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={convColor} stopOpacity={0.18} />
                <stop offset="100%" stopColor={convColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vqBookFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={bookColor} stopOpacity={0.18} />
                <stop offset="100%" stopColor={bookColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={fmtDay}
              tick={axisStyle}
              axisLine={{ stroke: axisLineColor }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipBox />} cursor={{ stroke: tickColor, strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="conversations"
              name="Conversations"
              stroke={convColor}
              strokeWidth={2.25}
              fill="url(#vqConvFill)"
              dot={{ r: 3, strokeWidth: 1.5, stroke: dotStroke, fill: convColor }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: dotStroke }}
            />
            <Area
              type="monotone"
              dataKey="bookings"
              name="Visits booked"
              stroke={bookColor}
              strokeWidth={2.25}
              fill="url(#vqBookFill)"
              dot={{ r: 3, strokeWidth: 1.5, stroke: dotStroke, fill: bookColor }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: dotStroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Horizontal bar list for categorical counts with explicit text labels and tabular numbers. */
export function BarList({ rows, color = SERIES.green, colorFor, format = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${format(r.value)}`} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-ink">{r.label}</span>
            <span className="font-mono text-[13px] tabular-nums text-ink-2">{format(r.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-section">
            <div
              className="h-2.5 rounded-full transition-all duration-300 group-hover:opacity-85"
              style={{
                width: `${Math.max(r.value > 0 ? 3 : 0, (r.value / max) * 100)}%`,
                background: colorFor ? colorFor(r) : color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
