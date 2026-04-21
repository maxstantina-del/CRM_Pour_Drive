/**
 * Local rule-based command engine for the CRM chat assistant.
 * No external API calls. Replace later with an LLM if richer answers are needed.
 */

import type { Lead, LeadStage } from '../../lib/types';

type IntentKind =
  | 'stats'
  | 'search'
  | 'top'
  | 'recall'
  | 'byCity'
  | 'byStage'
  | 'email'
  | 'help'
  | 'unknown';

interface Intent {
  kind: IntentKind;
  params: Record<string, string | number>;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function parseIntent(raw: string): Intent {
  const q = normalize(raw);

  if (!q || q === 'help' || q === 'aide' || q === '?' || q === '/help')
    return { kind: 'help', params: {} };

  // Commandes strictes : seulement si au début ET message court (≤ 5 mots).
  // Les phrases longues ou naturelles passent à l'IA.
  const wordCount = q.split(/\s+/).length;
  const isCommand = wordCount <= 5;

  if (isCommand) {
    if (q === 'stats' || q === 'bilan' || q === 'resume' || q === 'overview')
      return { kind: 'stats', params: {} };

    const topMatch = q.match(/^top\s*(\d+)?$/);
    if (topMatch) return { kind: 'top', params: { n: Number(topMatch[1] ?? 5) } };

    const recallMatch = q.match(/^(?:relanc\w*|a relancer|sans news|dormant)\s*(\d+)?$/);
    if (recallMatch) return { kind: 'recall', params: { days: Number(recallMatch[1] ?? 7) } };

    const cityMatch = q.match(/^ville\s+([a-z0-9\- ]+)$/);
    if (cityMatch) return { kind: 'byCity', params: { city: cityMatch[1].trim() } };

    const stageMatch = q.match(/^(?:stage|etape|statut)\s+([a-z_]+)$/);
    if (stageMatch) return { kind: 'byStage', params: { stage: stageMatch[1].trim() } };

    const emailMatch = q.match(/^email\s+([a-z_]+)?$/);
    if (emailMatch) return { kind: 'email', params: { stage: emailMatch[1] ?? 'new' } };

    const searchMatch = q.match(/^(?:cherche|chercher|trouve|search)\s+(.+)$/);
    if (searchMatch) return { kind: 'search', params: { query: searchMatch[1].trim() } };
  }

  return { kind: 'unknown', params: { raw: q } };
}

const STAGE_LABEL: Record<string, string> = {
  new: 'Nouveau',
  contact: 'Contact',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  meeting: 'RDV',
  proposal: 'Proposition',
  negotiation: 'Négociation',
  won: 'Gagné',
  closed_won: 'Gagné',
  lost: 'Perdu',
  closed_lost: 'Perdu',
};

function fmtEuro(v: number | undefined): string {
  if (!v || v === 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
}

function daysSince(iso?: string): number {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function leadSummary(l: Lead): string {
  const bits = [l.name];
  if (l.company && l.company !== l.name) bits.push(`(${l.company})`);
  if (l.city) bits.push(`— ${l.city}`);
  bits.push(`· ${STAGE_LABEL[l.stage] ?? l.stage}`);
  bits.push(`· ${fmtEuro(l.value)}`);
  return bits.join(' ');
}

export function runIntent(intent: Intent, leads: Lead[]): string {
  switch (intent.kind) {
    case 'help':
      return [
        '🤖 Commandes disponibles :',
        '• stats — pipeline en un coup d\'œil',
        '• top 5 — leads les plus gros en valeur',
        '• relancer 7 — leads sans update depuis N jours',
        '• ville Annecy — leads par ville',
        '• stage qualified — leads par étape',
        '• cherche <mot> — recherche dans nom/company/email',
        '• email proposal — template de relance par étape',
      ].join('\n');

    case 'stats': {
      const total = leads.length;
      if (total === 0) return '📭 Aucun lead pour le moment.';
      const byStage = leads.reduce<Record<string, number>>((acc, l) => {
        acc[l.stage] = (acc[l.stage] ?? 0) + 1;
        return acc;
      }, {});
      const won = (byStage.won ?? 0) + (byStage.closed_won ?? 0);
      const lost = (byStage.lost ?? 0) + (byStage.closed_lost ?? 0);
      const active = total - won - lost;
      const totalValue = leads.reduce((s, l) => s + (l.value ?? 0), 0);
      const wonValue = leads
        .filter(l => l.stage === 'won' || l.stage === 'closed_won')
        .reduce((s, l) => s + (l.value ?? 0), 0);
      const conv = total > 0 ? Math.round((won / total) * 100) : 0;
      return [
        `📊 Pipeline : ${total} leads (${active} actifs, ${won} gagnés, ${lost} perdus)`,
        `💰 Valeur totale : ${fmtEuro(totalValue)}`,
        `🏆 Valeur gagnée : ${fmtEuro(wonValue)}`,
        `📈 Taux de conversion : ${conv}%`,
        '',
        'Par étape :',
        ...Object.entries(byStage)
          .sort((a, b) => b[1] - a[1])
          .map(([k, n]) => `• ${STAGE_LABEL[k] ?? k} — ${n}`),
      ].join('\n');
    }

    case 'top': {
      const n = Math.max(1, Math.min(20, Number(intent.params.n) || 5));
      const sorted = [...leads]
        .filter(l => (l.value ?? 0) > 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .slice(0, n);
      if (sorted.length === 0) return 'Aucun lead avec une valeur renseignée.';
      return [`🔝 Top ${sorted.length} en valeur :`, ...sorted.map((l, i) => `${i + 1}. ${leadSummary(l)}`)].join('\n');
    }

    case 'recall': {
      const days = Number(intent.params.days) || 7;
      const toCall = leads
        .filter(l => l.stage !== 'won' && l.stage !== 'lost' && l.stage !== 'closed_won' && l.stage !== 'closed_lost')
        .filter(l => daysSince(l.updatedAt) >= days)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .slice(0, 10);
      if (toCall.length === 0) return `✅ Aucun lead actif sans mise à jour depuis ${days}j.`;
      return [
        `🔔 À relancer (${days}j+ sans update) — top 10 par valeur :`,
        ...toCall.map((l, i) => `${i + 1}. ${leadSummary(l)} · ${daysSince(l.updatedAt)}j`),
      ].join('\n');
    }

    case 'byCity': {
      const city = String(intent.params.city).toLowerCase();
      const matches = leads.filter(l => (l.city ?? '').toLowerCase().includes(city));
      if (matches.length === 0) return `Aucun lead à "${intent.params.city}".`;
      return [
        `📍 ${matches.length} leads à ${intent.params.city} :`,
        ...matches.slice(0, 15).map(l => `• ${leadSummary(l)}`),
        matches.length > 15 ? `… et ${matches.length - 15} autres` : '',
      ].filter(Boolean).join('\n');
    }

    case 'byStage': {
      const stage = String(intent.params.stage);
      const matches = leads.filter(l => l.stage === (stage as LeadStage));
      if (matches.length === 0) return `Aucun lead au stage "${stage}".`;
      return [
        `📌 ${matches.length} leads en ${STAGE_LABEL[stage] ?? stage} :`,
        ...matches.slice(0, 15).map(l => `• ${leadSummary(l)}`),
        matches.length > 15 ? `… et ${matches.length - 15} autres` : '',
      ].filter(Boolean).join('\n');
    }

    case 'search': {
      const q = String(intent.params.query).toLowerCase();
      const matches = leads.filter(l => {
        const hay = [l.name, l.company, l.email, l.phone, l.city, l.contactName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
      if (matches.length === 0) return `🔍 Rien ne contient "${intent.params.query}".`;
      return [
        `🔍 ${matches.length} résultats pour "${intent.params.query}" :`,
        ...matches.slice(0, 10).map(l => `• ${leadSummary(l)}`),
        matches.length > 10 ? `… et ${matches.length - 10} autres` : '',
      ].filter(Boolean).join('\n');
    }

    case 'email': {
      const stage = String(intent.params.stage);
      const templates: Record<string, string> = {
        new: [
          'Objet : Prise de contact — {{company}}',
          '',
          'Bonjour {{contactName}},',
          '',
          'Je me permets de vous contacter suite à mon intérêt pour {{company}}.',
          'J\'aimerais échanger 15 min pour comprendre vos enjeux et voir si je peux vous être utile.',
          '',
          'Êtes-vous disponible cette semaine ?',
          '',
          'Bien cordialement,',
          'Max',
        ].join('\n'),
        contacted: [
          'Objet : Suite de notre échange — {{company}}',
          '',
          'Bonjour {{contactName}},',
          '',
          'Je reviens vers vous suite à notre dernière discussion.',
          'Avez-vous eu le temps de réfléchir à ma proposition ?',
          '',
          'Je reste à votre disposition pour toute question.',
        ].join('\n'),
        qualified: [
          'Objet : Prochaine étape — {{company}}',
          '',
          'Bonjour {{contactName}},',
          '',
          'Je vous remercie pour le temps accordé. Comme convenu, je vous propose un RDV pour approfondir vos besoins et présenter la solution adaptée.',
          '',
          'Quelle serait votre meilleure disponibilité cette semaine ?',
        ].join('\n'),
        proposal: [
          'Objet : Proposition commerciale — {{company}}',
          '',
          'Bonjour {{contactName}},',
          '',
          'Suite à nos échanges, vous trouverez ci-joint la proposition détaillée.',
          'Je reste à votre écoute pour en discuter et ajuster si nécessaire.',
          '',
          'Quand puis-je vous rappeler ?',
        ].join('\n'),
        negotiation: [
          'Objet : Ajustement proposition — {{company}}',
          '',
          'Bonjour {{contactName}},',
          '',
          'Comme convenu, j\'ai retravaillé la proposition selon vos retours. Vous trouverez les ajustements ci-joints.',
          'Validons ensemble dans la semaine ?',
        ].join('\n'),
      };
      const tpl = templates[stage] ?? templates.new;
      return `📧 Template email (${STAGE_LABEL[stage] ?? stage}) — remplace {{company}} et {{contactName}} :\n\n${tpl}`;
    }

    case 'unknown':
    default:
      return `Je ne comprends pas "${intent.params.raw ?? ''}". Tape "aide" pour voir les commandes.`;
  }
}

export function handle(input: string, leads: Lead[]): string {
  return runIntent(parseIntent(input), leads);
}
