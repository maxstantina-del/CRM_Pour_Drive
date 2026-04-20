import { useState, type FormEvent } from 'react';
import { Phone, Mail, Calendar, FileText, TrendingUp, CheckSquare, Trash2, Plus, Loader2 } from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import type { ActivityType } from '../../services/activitiesService';

const ICON: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  stage_change: TrendingUp,
  task: CheckSquare,
};

const LABEL: Record<ActivityType, string> = {
  call: 'Appel',
  email: 'Email',
  meeting: 'RDV',
  note: 'Note',
  stage_change: 'Changement d\'étape',
  task: 'Tâche',
};

const COLOR: Record<ActivityType, string> = {
  call: 'bg-blue-100 text-blue-700',
  email: 'bg-indigo-100 text-indigo-700',
  meeting: 'bg-purple-100 text-purple-700',
  note: 'bg-amber-100 text-amber-700',
  stage_change: 'bg-emerald-100 text-emerald-700',
  task: 'bg-slate-100 text-slate-700',
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return 'il y a qq min';
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  return d.toLocaleDateString('fr-FR');
}

function renderSummary(a: { type: ActivityType; payload: Record<string, unknown> }): string {
  const { type, payload } = a;
  if (type === 'stage_change') return `${payload.from ?? '?'} → ${payload.to ?? '?'}`;
  if (type === 'email' && payload.subject) return String(payload.subject);
  if (payload.note || payload.text) return String(payload.note ?? payload.text);
  if (payload.title) return String(payload.title);
  return '';
}

export function ActivityTimeline({ leadId }: { leadId: string }) {
  const { activities, loading, addActivity, removeActivity } = useActivities(leadId);
  const [type, setType] = useState<ActivityType>('note');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await addActivity(type, type === 'email' ? { subject: text } : { note: text });
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">Historique</h4>

      <form onSubmit={submit} className="flex gap-2">
        <select
          value={type}
          onChange={e => setType(e.target.value as ActivityType)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="note">Note</option>
          <option value="call">Appel</option>
          <option value="email">Email</option>
          <option value="meeting">RDV</option>
          <option value="task">Tâche</option>
        </select>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ajouter au journal…"
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim() || saving}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded flex items-center gap-1"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
        </button>
      </form>

      {loading && activities.length === 0 && (
        <p className="text-xs text-gray-500">Chargement…</p>
      )}
      {!loading && activities.length === 0 && (
        <p className="text-xs text-gray-500">Aucune activité. Ajoute la première ci-dessus.</p>
      )}

      <ul className="space-y-2 max-h-72 overflow-y-auto">
        {activities.map(a => {
          const Icon = ICON[a.type];
          return (
            <li key={a.id} className="flex items-start gap-2 group">
              <span className={`p-1.5 rounded-full ${COLOR[a.type]}`}>
                <Icon className="w-3 h-3" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{LABEL[a.type]}</span>
                  <span>· {formatWhen(a.occurredAt)}</span>
                </div>
                <p className="text-sm text-gray-900 truncate">{renderSummary(a) || '—'}</p>
              </div>
              <button
                onClick={() => removeActivity(a.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
