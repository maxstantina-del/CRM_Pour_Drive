import { useState } from 'react';
import { Plus, Edit3, Trash2, FileText, Download, Truck, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '../ui';
import { useFiches } from '../../hooks/useFiches';
import { FicheFormModal } from './FicheFormModal';
import type { Fiche } from '../../services/fichesService';
import { exportFicheToPDF } from '../../lib/ficheExport';
import type { Lead } from '../../lib/types';

const VEHICLE_LABELS: Record<string, string> = {
  VL: 'VL',
  utilitaire: 'Utilitaire',
  poids_lourd: 'Poids lourd',
};

const DAMAGE_LABELS: Record<string, string> = {
  impact: 'Impact',
  fissure: 'Fissure',
  bris_complet: 'Bris complet',
};

const DAMAGE_LOCATION_LABELS: Record<string, string> = {
  pare_brise: 'Pare-brise',
  laterale: 'Latérale',
  lunette: 'Lunette arrière',
};

function formatAppointment(raw: string | null): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?/);
  if (!m) return raw;
  const [, y, mo, d, time] = m;
  const dt = new Date(`${y}-${mo}-${d}T${time || '00:00'}`);
  const day = dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  return time ? `${day} à ${time.replace(':', 'h')}` : day;
}

export interface FichesSectionProps {
  lead: Lead;
}

export function FichesSection({ lead }: FichesSectionProps) {
  const leadId = lead.id;
  const leadName = lead.name;
  const leadCompany = lead.company;
  const { fiches, loading, addFiche, editFiche, removeFiche } = useFiches(leadId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fiche | null>(null);

  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (fiche: Fiche) => {
    setEditing(fiche);
    setModalOpen(true);
  };

  const handleSubmit = async (input: Parameters<typeof addFiche>[0]) => {
    if (editing) await editFiche(editing.id, input);
    else await addFiche(input);
  };

  const handleDelete = async (fiche: Fiche) => {
    if (!confirm(`Supprimer la fiche ${fiche.vehiclePlate || '(sans immat)'} ?`)) return;
    await removeFiche(fiche.id);
  };

  const handleExport = (fiche: Fiche) => {
    exportFicheToPDF(fiche, { leadName, leadCompany });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText size={14} className="text-blue-600 dark:text-blue-400" />
          Fiches Autoglass
          {fiches.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {fiches.length}
            </span>
          )}
        </h4>
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={handleNew}>
          Nouvelle fiche
        </Button>
      </div>

      {loading && fiches.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">Chargement…</p>
      )}

      {!loading && fiches.length === 0 && (
        <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pas encore de fiche. Clique sur « Nouvelle fiche » pour saisir les infos du véhicule.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Tu peux ajouter plusieurs fiches si la flotte a plusieurs véhicules à réparer.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {fiches.map((f) => (
          <div
            key={f.id}
            className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-900"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Truck size={16} className="text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {f.vehiclePlate || '(sans immat)'}
                </span>
                {f.vehicleType && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {VEHICLE_LABELS[f.vehicleType]}
                  </span>
                )}
                {f.vehicleBrandModel && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {f.vehicleBrandModel}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                {f.damageType && (
                  <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-300">
                    <AlertTriangle size={11} />
                    {DAMAGE_LABELS[f.damageType]}
                    {f.damageLocation && ` – ${DAMAGE_LOCATION_LABELS[f.damageLocation]}`}
                  </span>
                )}
                {f.immobilized === true && (
                  <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-medium">
                    Immobilisé
                  </span>
                )}
                {f.interventionPlace && (
                  <span>
                    · {f.interventionPlace === 'sur_site' ? 'Sur site' : 'En centre'}
                  </span>
                )}
                {f.insuranceGlassCovered === 'oui' && <span>· Bris de glace ✓</span>}
              </div>
              {formatAppointment(f.availability) && (
                <div className="mt-1 flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300">
                  <Calendar size={11} />
                  <span className="font-medium">{formatAppointment(f.availability)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleExport(f)}
                title="Exporter en PDF"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Download size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleEdit(f)}
                title="Modifier"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(f)}
                title="Supprimer"
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <FicheFormModal
        isOpen={modalOpen}
        initial={editing}
        lead={lead}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
