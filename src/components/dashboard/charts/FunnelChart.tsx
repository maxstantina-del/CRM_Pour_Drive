/**
 * Pipeline funnel: horizontal tapered bars with count + drop-off rate.
 * SVG-free — pure Tailwind boxes sized by % of the first stage.
 */

import React from 'react';
import type { FunnelRow } from '../../../lib/dashboardMetrics';

export interface FunnelChartProps {
  data: FunnelRow[];
}

function formatEuroShort(v: number): string {
  if (v === 0) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M€`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10_000 ? 0 : 1)}k€`;
  return `${v}€`;
}

// Blue-to-green gradient across funnel steps
const GRADIENT = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#F97316', '#10B981', '#059669'];

export function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) return <div className="text-gray-400 dark:text-gray-500 text-sm p-4">Aucune donnée.</div>;
  const max = data[0].count || 1;

  return (
    <div className="space-y-2">
      {data.map((row, i) => {
        const widthPct = Math.max(8, (row.count / max) * 100); // floor 8% so empty stages stay visible
        const color = GRADIENT[i % GRADIENT.length];
        const rate = row.dropOffPct;
        return (
          <div key={row.stageId} className="flex items-center gap-3">
            <div className="w-32 text-sm text-gray-700 dark:text-gray-200 font-medium shrink-0">{row.label}</div>

            <div className="flex-1 relative h-10 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center justify-between px-3 transition-all duration-300"
                style={{ width: `${widthPct}%`, backgroundColor: color }}
              >
                <span className="text-white font-bold text-sm">{row.count}</span>
                <span className="text-white/90 text-xs">{formatEuroShort(row.value)}</span>
              </div>
            </div>

            <div className="w-20 text-right shrink-0">
              {rate === null ? (
                <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
              ) : (
                <span
                  className={`text-xs font-semibold ${
                    rate >= 40 ? 'text-green-600 dark:text-green-400' : rate >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                  }`}
                  title={`${rate}% vs étape précédente`}
                >
                  {rate}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
