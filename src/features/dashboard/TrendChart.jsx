import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from '@/lib/format';
import { Segmented } from '@/components/ui/Controls';

const METRICS = [
  { value: 'overall', label: 'Overall', short: 'Overall' },
  { value: 'technical', label: 'Technical', short: 'Tech' },
  { value: 'communication', label: 'Communication', short: 'Comm.' },
  { value: 'problemSolving', label: 'Problem solving', short: 'Problem' },
];
const LABEL = Object.fromEntries(METRICS.map((m) => [m.value, m.label]));
// Short labels on phones so the switcher fits without scrolling.
const OPTIONS = METRICS.map((m) => ({
  value: m.value,
  label: (
    <>
      <span className="sm:hidden">{m.short}</span>
      <span className="hidden sm:inline">{m.label}</span>
    </>
  ),
}));

function TooltipCard({ active, payload, metric }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-fg">{p.company}</p>
      <p className="text-subtle">{formatDate(p.date, { time: true })}</p>
      <p className="mt-1.5 flex items-center gap-2 text-fg">
        <span className="inline-block h-0.5 w-3 rounded-full bg-chart-1" aria-hidden="true" />
        {LABEL[metric]} <span className="ml-auto pl-3 font-semibold tabular-nums">{p[metric] ?? '—'}</span>
      </p>
    </div>
  );
}

/** Value printed at the end of the line only (selective direct label). */
function EndLabel({ x, y, index, value, lastIndex }) {
  if (index !== lastIndex || value == null) return null;
  return (
    <text x={x + 10} y={y + 4} className="fill-fg text-xs font-semibold">
      {value}
    </text>
  );
}

/** Single-series score trend with a metric switcher (one line at a time keeps it readable). */
export default function TrendChart({ trend }) {
  const [metric, setMetric] = useState('overall');
  const data = trend.map((t, i) => ({ ...t, label: formatDate(t.date), n: i + 1 }));
  const last = data[data.length - 1];

  return (
    <div>
      <Segmented size="sm" name="Metric" options={OPTIONS} value={metric} onChange={setMetric} className="mb-4" />
      <div className="h-64 sm:h-72" role="img" aria-label={`${LABEL[metric]} score across ${data.length} interviews, latest ${last ? last[metric] : '—'}`}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 640, height: 280 }}>
          <LineChart data={data} margin={{ top: 10, right: 34, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--subtle)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--line-strong)' }} minTickGap={24} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: 'var(--subtle)', fontSize: 12 }} tickLine={false} axisLine={false} width={36} />
            <Tooltip content={<TooltipCard metric={metric} />} cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="var(--chart-1)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{ r: 4, fill: 'var(--chart-1)', stroke: 'var(--surface)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'var(--chart-1)', stroke: 'var(--surface)', strokeWidth: 2 }}
              label={<EndLabel lastIndex={data.length - 1} />}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-3">
        <summary className="text-xs text-subtle hover:text-fg">View as table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-subtle">
              <tr>
                <th className="py-1.5 pr-3 font-medium">Date</th>
                <th className="py-1.5 pr-3 font-medium">Company</th>
                {METRICS.map((m) => (
                  <th key={m.value} className="py-1.5 pr-3 text-right font-medium">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {data.map((r) => (
                <tr key={r.id}>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="py-1.5 pr-3">{r.company}</td>
                  {METRICS.map((m) => (
                    <td key={m.value} className="py-1.5 pr-3 text-right">
                      {r[m.value] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
