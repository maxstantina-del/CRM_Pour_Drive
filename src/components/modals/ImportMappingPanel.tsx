/**
 * Lets the user review auto-detected column mapping and override per column
 * before triggering the actual bulk insert.
 */

import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  type LeadField,
  type PreviewData,
  LEAD_FIELD_LABELS,
  LEAD_FIELDS_ORDER,
  autoDetectField,
  countImportable,
  isMappingValid,
  sampleValues,
} from '../../lib/importParsers';

export interface ImportMappingPanelProps {
  preview: PreviewData;
  mapping: Record<number, LeadField>;
  onMappingChange: (next: Record<number, LeadField>) => void;
}

const IGNORE = '__ignore__';

export function ImportMappingPanel({ preview, mapping, onMappingChange }: ImportMappingPanelProps) {
  const { headers, rows, fileName } = preview;

  const { importable, skipped } = useMemo(
    () => countImportable(headers, rows, mapping),
    [headers, rows, mapping]
  );

  const valid = isMappingValid(mapping);

  // Track which fields are already mapped to prevent duplicates (except Ignore).
  const usedFields = useMemo(() => new Set(Object.values(mapping)), [mapping]);

  const handleChange = (colIdx: number, v: string) => {
    const next = { ...mapping };
    if (v === IGNORE) {
      delete next[colIdx];
    } else {
      // remove the same field from any other column first (one-to-one)
      for (const [k, f] of Object.entries(next)) {
        if (f === v && Number(k) !== colIdx) delete next[Number(k)];
      }
      next[colIdx] = v as LeadField;
    }
    onMappingChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">
            Fichier : <span className="font-medium text-gray-900">{fileName}</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {headers.length} colonne{headers.length > 1 ? 's' : ''} · {rows.length} lignes détectées.
            Ajuste les correspondances si nécessaire.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-emerald-600">{importable}</p>
          <p className="text-xs text-gray-500">à importer</p>
          {skipped > 0 && (
            <p className="text-xs text-amber-600 mt-1">{skipped} ignorés (ni nom ni entreprise)</p>
          )}
        </div>
      </div>

      {!valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            Au moins une colonne doit être mappée à <strong>Nom</strong> ou <strong>Entreprise</strong>.
          </p>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Colonne source</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-8"></th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-44">Mapper vers</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Échantillon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {headers.map((header, idx) => {
                const autoField = autoDetectField(header);
                const ignored = !mapping[idx];
                const current: string = ignored ? IGNORE : mapping[idx];
                const isAutoMatch = autoField !== null && mapping[idx] === autoField;
                const samples = sampleValues(rows, idx);
                return (
                  <tr key={idx} className={ignored ? 'bg-gray-50/50' : ''}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 align-top">
                      {header || <span className="italic text-gray-400">Colonne {idx + 1}</span>}
                    </td>
                    <td className="px-1 py-2 align-top">
                      {isAutoMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-label="Auto-détecté" />
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        value={current}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={IGNORE}>— Ignorer —</option>
                        {LEAD_FIELDS_ORDER.map((f) => {
                          const takenByOther = usedFields.has(f) && mapping[idx] !== f;
                          return (
                            <option key={f} value={f} disabled={takenByOther}>
                              {LEAD_FIELD_LABELS[f]}{takenByOther ? ' (déjà utilisé)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {samples.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">vide</span>
                      ) : (
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {samples.map((s, i) => (
                            <div key={i} className="truncate max-w-xs">{s}</div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
