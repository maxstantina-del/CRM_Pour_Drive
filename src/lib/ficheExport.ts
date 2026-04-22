/**
 * Fiche Autoglass PDF export via browser print dialog.
 * Opens a new window with a print-optimized HTML layout and triggers
 * print(); the user saves as PDF. No extra dependency.
 */

import type { Fiche } from '../services/fichesService';

const VEHICLE: Record<string, string> = {
  VL: 'Voiture légère',
  utilitaire: 'Utilitaire',
  poids_lourd: 'Poids lourd',
};
const DAMAGE: Record<string, string> = {
  impact: 'Impact',
  fissure: 'Fissure',
  bris_complet: 'Bris complet',
};
const DAMAGE_LOC: Record<string, string> = {
  pare_brise: 'Pare-brise',
  laterale: 'Vitre latérale',
  lunette: 'Lunette arrière',
};
const PLACE: Record<string, string> = {
  sur_site: 'Sur site',
  en_centre: 'En centre Autoglass',
};
const COVERED: Record<string, string> = {
  oui: 'Oui',
  non: 'Non',
  inconnu: 'Ne sait pas',
};

function esc(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Parse 'YYYY-MM-DD HH:MM | note' (or 'YYYY-MM-DD | note', or legacy free text)
 * and render a human-readable French string for the PDF and card display.
 */
function prettyAvailability(raw: string | null): string {
  if (!raw) return '—';
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?(?:\s*\|\s*(.*))?$/);
  if (!match) return esc(raw);
  const [, y, mo, d, time, note] = match;
  const dt = new Date(`${y}-${mo}-${d}T${time || '00:00'}`);
  const dateStr = dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const parts: string[] = [dateStr];
  if (time) parts.push(`à ${time.replace(':', 'h')}`);
  if (note) parts.push(`— ${note}`);
  return esc(parts.join(' ')).replace(/^./, (c) => c.toUpperCase());
}

function row(label: string, value: string): string {
  return `<tr><th>${label}</th><td>${value}</td></tr>`;
}

function section(title: string, rows: string): string {
  return `<table class="section"><caption>${title}</caption><tbody>${rows}</tbody></table>`;
}

export interface ExportContext {
  leadName: string;
  leadCompany?: string;
}

export function exportFicheToPDF(fiche: Fiche, ctx: ExportContext): void {
  const entreprise = ctx.leadCompany || ctx.leadName;
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Fiche Autoglass – ${esc(fiche.vehiclePlate || entreprise)}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1f2937; margin: 0; padding: 0; font-size: 11pt; line-height: 1.35; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 16px; }
  .brand { font-size: 18pt; font-weight: 700; color: #2563eb; }
  .brand small { font-weight: 500; font-size: 10pt; color: #6b7280; display:block; }
  .meta { text-align: right; font-size: 9pt; color: #6b7280; }
  h1 { font-size: 14pt; margin: 0 0 4px 0; }
  .subtitle { font-size: 10pt; color: #6b7280; margin-bottom: 14px; }
  table.section { width: 100%; border-collapse: collapse; margin-bottom: 10px; page-break-inside: avoid; }
  table.section caption { text-align: left; font-weight: 700; color: #2563eb; text-transform: uppercase; font-size: 9pt; letter-spacing: 0.5px; padding: 6px 8px; background: #eff6ff; border-left: 3px solid #2563eb; }
  table.section th, table.section td { border-bottom: 1px solid #e5e7eb; padding: 5px 8px; text-align: left; vertical-align: top; }
  table.section th { width: 35%; font-weight: 500; color: #4b5563; font-size: 10pt; }
  table.section td { font-size: 11pt; color: #111827; }
  .comment-block { white-space: pre-wrap; background: #f9fafb; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb; }
  .urgent { color: #dc2626; font-weight: 600; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 8.5pt; color: #9ca3af; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ChosenMX <small>Apporteur d'affaires Autoglass</small></div>
    </div>
    <div class="meta">
      <div><strong>Date :</strong> ${today}</div>
      <div><strong>Référence :</strong> ${esc(fiche.id.slice(0, 8))}</div>
    </div>
  </div>

  <h1>Fiche de prise d'informations – Autoglass</h1>
  <p class="subtitle">Entreprise : <strong>${esc(entreprise)}</strong></p>

  ${section(
    'Contact intervention',
    row('Nom + prénom', esc(fiche.contactName)) +
      row('Fonction', esc(fiche.contactRole)) +
      row('Téléphone direct', esc(fiche.contactPhone)) +
      row('Email', esc(fiche.contactEmail))
  )}

  ${section(
    'Véhicule',
    row('Type', fiche.vehicleType ? esc(VEHICLE[fiche.vehicleType]) : '—') +
      row('Marque + modèle', esc(fiche.vehicleBrandModel)) +
      row('Immatriculation', `<strong>${esc(fiche.vehiclePlate)}</strong>`)
  )}

  ${section(
    'Sinistre',
    row('Type de dommage', fiche.damageType ? esc(DAMAGE[fiche.damageType]) : '—') +
      row('Localisation', fiche.damageLocation ? esc(DAMAGE_LOC[fiche.damageLocation]) : '—') +
      row(
        'Véhicule immobilisé',
        fiche.immobilized === true
          ? '<span class="urgent">OUI — urgence</span>'
          : fiche.immobilized === false
          ? 'Non'
          : '—'
      )
  )}

  ${section(
    'Intervention',
    row('Adresse', esc(fiche.interventionAddress)) +
      row('Lieu', fiche.interventionPlace ? esc(PLACE[fiche.interventionPlace]) : '—') +
      row('Rendez-vous souhaité', prettyAvailability(fiche.availability))
  )}

  ${section(
    'Assurance',
    row('Nom de l\'assurance', esc(fiche.insuranceName)) +
      row('Bris de glace inclus', fiche.insuranceGlassCovered ? esc(COVERED[fiche.insuranceGlassCovered]) : '—') +
      row('Numéro de contrat', esc(fiche.insuranceContract))
  )}

  ${
    fiche.comment
      ? `<table class="section"><caption>Commentaire</caption><tbody><tr><td><div class="comment-block">${esc(fiche.comment)}</div></td></tr></tbody></table>`
      : ''
  }

  <div class="footer">
    Fiche générée par CRM ChosenMX · ${today} · Référence ${esc(fiche.id)}
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 200);
    });
  </script>
</body>
</html>`;

  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');
  if (!w) {
    alert('Le navigateur a bloqué la fenêtre. Autorise les pop-ups pour chosen-mx.com.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
