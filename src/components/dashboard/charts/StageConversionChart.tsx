/**
 * Horizontal bar chart of pair-wise conversion rates.
 * Red <20% / amber 20-40% / green >40%.
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { type StageConversionRow, conversionColor } from '../../../lib/dashboardMetrics';

export interface StageConversionChartProps {
  data: StageConversionRow[];
}

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ payload: StageConversionRow }>;
}

function CustomTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900 dark:text-gray-100">
        {row.fromLabel} → {row.toLabel}
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        {row.toCount} / {row.fromCount} leads
      </p>
      <p className="font-bold" style={{ color: conversionColor(row.rate) }}>
        {row.rate}% conversion
      </p>
    </div>
  );
}

export function StageConversionChart({ data }: StageConversionChartProps) {
  if (data.length === 0) {
    return <div className="text-gray-400 dark:text-gray-500 text-sm p-4">Pas assez d'étapes pour calculer.</div>;
  }

  const rows = data.map((r) => ({ ...r, label: `${r.fromLabel} → ${r.toLabel}` }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 42)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={160}
          tick={{ fontSize: 11, fill: '#374151' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
        <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
          {rows.map((r) => (
            <Cell key={r.from} fill={conversionColor(r.rate)} />
          ))}
          <LabelList
            dataKey="rate"
            position="right"
            formatter={(v) => `${v}%`}
            style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
