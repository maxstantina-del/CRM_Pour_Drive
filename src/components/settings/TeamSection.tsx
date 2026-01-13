import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Shield, User, Clock } from 'lucide-react';
import { TeamMember } from '../../lib/types';
import { useToast } from '../../contexts/ToastContext';
import { getSetting, setSetting } from '../../lib/db';

const STORAGE_KEY = 'crm_team_members';

export function TeamSection() {
    const { showToast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'user' | 'manager'>('user');

    useEffect(() => {
        async function loadData() {
            const saved = await getSetting(STORAGE_KEY);
            if (saved) {
                setMembers(JSON.parse(saved));
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        if (members.length > 0 || members.length === 0) { // Save even empty array
            setSetting(STORAGE_KEY, JSON.stringify(members));
        }
    }, [members]);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        const newMember: TeamMember = {
            id: crypto.randomUUID(),
            name: email.split('@')[0], // Placeholder name from email
            email,
            role,
            status: 'pending',
            joinedAt: new Date().toISOString()
        };

        setMembers([...members, newMember]);
        setEmail('');
        setIsInviteOpen(false);
        showToast(`✉️ Invitation envoyée à ${email}`, 'success');
    };

    const removeMember = (id: string) => {
        if (confirm('Voulez-vous vraiment retirer ce membre ?')) {
            setMembers(members.filter(m => m.id !== id));
            showToast('Membre retiré', 'success');
        }
    };

    return (
        <div className="space-y-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white">Équipe</h3>
                    <p className="text-sm text-gray-400">Gérez les membres de votre équipe et leurs accès</p>
                </div>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    Inviter
                </button>
            </div>

            {isInviteOpen && (
                <form onSubmit={handleInvite} className="bg-white/5 p-4 rounded-lg space-y-4 border border-white/10">
                    <h4 className="font-medium text-white text-sm">Inviter un nouveau membre</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email du collaborateur..."
                            className="bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-accent-blue focus:outline-none"
                            autoFocus
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                            className="bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:ring-1 focus:ring-accent-blue focus:outline-none"
                        >
                            <option value="user">Utilisateur</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Administrateur</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsInviteOpen(false)}
                            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1.5 bg-accent-blue hover:bg-accent-blue/80 text-white text-xs rounded transition-colors"
                        >
                            Envoyer l'invitation
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {members.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-lg border border-dashed border-white/10">
                        <User size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Aucun membre dans l'équipe</p>
                        <p className="text-xs mt-1">Invitez vos collaborateurs pour commencer.</p>
                    </div>
                ) : (
                    members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-white">{member.email}</p>
                                        {member.status === 'pending' && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                <Clock size={10} />
                                                En attente
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Shield size={10} />
                                        {member.role === 'admin' ? 'Administrateur' : member.role === 'manager' ? 'Manager' : 'Utilisateur'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeMember(member.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Retirer le membre"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
