import { useState } from 'react';
import { useEmailTemplates, EmailTemplate } from '../../hooks/useEmailTemplates';
import { Button, Input } from '../ui';
import { Plus, Trash2, Edit2, Save, Mail } from 'lucide-react';
import { ConfirmModal } from '../modals/ConfirmModal';

export function EmailTemplatesSection() {
    const { templates, addTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: ''
    });

    const resetForm = () => {
        setFormData({ name: '', subject: '', body: '' });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (template: EmailTemplate) => {
        setFormData({
            name: template.name,
            subject: template.subject,
            body: template.body
        });
        setEditingId(template.id);
        setIsAdding(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateTemplate(editingId, formData);
        } else {
            addTemplate(formData);
        }
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-1">Modèles d'emails</h2>
                    <p className="text-sm text-gray-400">Gérez vos modèles pour gagner du temps lors de vos échanges.</p>
                </div>
                {!isAdding && !editingId && (
                    <Button onClick={() => setIsAdding(true)}>
                        <Plus size={18} className="mr-2" />
                        Nouveau modèle
                    </Button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-medium text-gray-200 mb-4">
                        {editingId ? 'Modifier le modèle' : 'Nouveau modèle'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nom du modèle (interne)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Relance client #1"
                            required
                        />
                        <Input
                            label="Objet de l'email"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Sujet qui apparaîtra dans le mail"
                            required
                        />
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Corps du message</label>
                            <textarea
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                className="w-full h-48 bg-[#1e293b] border border-gray-600 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                                placeholder="Bonjour {contact_name}, ..."
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Astuce : Utilisez {'{contact_name}'} pour insérer automatiquement le nom du contact.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Annuler
                            </Button>
                            <Button type="submit">
                                <Save size={18} className="mr-2" />
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-accent-blue/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-accent-blue/20 rounded-lg text-accent-blue">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-200">{template.name}</h4>
                                <p className="text-sm text-gray-400 truncate max-w-md">{template.subject}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(template)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Modifier"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => setDeleteId(template.id)}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-gray-500">
                        Aucun modèle d'email configuré.
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => {
                    if (deleteId) {
                        deleteTemplate(deleteId);
                        setDeleteId(null);
                    }
                }}
                title="Supprimer le modèle"
                message="Êtes-vous sûr de vouloir supprimer ce modèle d'email ?"
                confirmLabel="Supprimer"
                variant="danger"
            />
        </div>
    );
}
