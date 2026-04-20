import { useState, useEffect, type FormEvent } from 'react';
import { Users, UserPlus, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import * as service from '../../services/pipelineMembersService';
import type { PipelineMember, PipelineRole } from '../../services/pipelineMembersService';
import { useToast } from '../../contexts/ToastContext';

const ROLE_LABEL: Record<PipelineRole, string> = {
  owner: 'Propriétaire',
  admin: 'Admin',
  member: 'Membre',
  viewer: 'Lecture seule',
};

export function MembersPanel({ pipelineId, pipelineName }: { pipelineId: string; pipelineName: string }) {
  const { showToast } = useToast();
  const [members, setMembers] = useState<PipelineMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PipelineRole>('member');
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setMembers(await service.listMembers(pipelineId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineId]);

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setInviting(true);
    try {
      const result = await service.inviteMember(pipelineId, clean, role);
      if (result.ok) {
        showToast(`${clean} ajouté comme ${ROLE_LABEL[role]}`, 'success');
        setEmail('');
        await load();
      } else if (result.reason === 'user_not_found') {
        showToast(
          `${clean} n'a pas de compte. Demande-lui de s'inscrire sur le CRM d'abord.`,
          'error'
        );
      } else if (result.reason === 'already_member') {
        showToast('Déjà membre de ce pipeline.', 'info');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Erreur : ${msg}`, 'error');
    } finally {
      setInviting(false);
    }
  };

  const remove = async (m: PipelineMember) => {
    if (!confirm(`Retirer ${m.email ?? m.userId} du pipeline ?`)) return;
    await service.removeMember(pipelineId, m.userId);
    await load();
    showToast('Membre retiré', 'success');
  };

  const changeRole = async (m: PipelineMember, newRole: PipelineRole) => {
    await service.updateMemberRole(pipelineId, m.userId, newRole);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Partenaires de « {pipelineName} »</h3>
      </div>

      <form onSubmit={invite} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email du partenaire (déjà inscrit)"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
          required
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value as PipelineRole)}
          className="px-2 py-2 text-sm border border-gray-300 rounded"
        >
          <option value="admin">Admin</option>
          <option value="member">Membre</option>
          <option value="viewer">Lecture seule</option>
        </select>
        <button
          type="submit"
          disabled={!email.trim() || inviting}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded"
        >
          {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Inviter
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun partenaire pour le moment. Invite quelqu'un ci-dessus.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border rounded-lg">
          {members.map(m => (
            <li key={m.userId} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{m.email ?? m.userId}</p>
                <p className="text-xs text-gray-500">Ajouté le {new Date(m.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  onChange={e => changeRole(m, e.target.value as PipelineRole)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                  disabled={m.role === 'owner'}
                >
                  <option value="owner">{ROLE_LABEL.owner}</option>
                  <option value="admin">{ROLE_LABEL.admin}</option>
                  <option value="member">{ROLE_LABEL.member}</option>
                  <option value="viewer">{ROLE_LABEL.viewer}</option>
                </select>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => remove(m)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Retirer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Pour inviter quelqu'un, il doit d'abord créer un compte sur ce CRM. Partage l'URL,
          il s'inscrit avec son email, puis tu l'ajoutes ici avec le même email.
        </p>
      </div>
    </div>
  );
}
