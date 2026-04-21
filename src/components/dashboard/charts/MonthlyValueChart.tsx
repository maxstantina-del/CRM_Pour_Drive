/**
 * Bar chart: won value per month over the last 12 months.
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyWonRow } from '../../../lib/dashboardMetrics';

export interface MonthlyValueChartProps {
  data: MonthlyWonRow[];
}

function formatEuroShort(v: number): string {
  if (v === 0) return '0€';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M€`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10_000 ? 0 : 1)}k€`;
  return `${v}€`;
}

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ payload: MonthlyWonRow }>;
}

function CustomTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900">{row.label}</p>
      <p className="text-gray-600">
        {row.wonCount} lead{row.wonCount > 1 ? 's' : ''} gagné{row.wonCount > 1 ? 's' : ''}
      </p>
      <p className="font-bold text-green-600">{formatEuroShort(row.wonValue)}</p>
    </div>
  );
}

export function MonthlyValueChart({ data }: MonthlyValueChartProps) {
  const hasData = data.some((r) => r.wonValue > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Aucun lead gagné sur les 12 derniers mois.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatEuroShort} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} />
        <Bar dataKey="wonValue" fill="#10B981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
