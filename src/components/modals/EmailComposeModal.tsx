import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../ui';
import { Mail, Send, X, FileText } from 'lucide-react';
import { useEmailTemplates } from '../../hooks/useEmailTemplates';

interface EmailComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientEmail: string;
    recipientName: string;
}

export function EmailComposeModal({ isOpen, onClose, recipientEmail, recipientName }: EmailComposeModalProps) {
    const { templates } = useEmailTemplates();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    // Reset form when opening for a new recipient
    useEffect(() => {
        if (isOpen) {
            setSubject('');
            setMessage(`Bonjour ${recipientName},\n\n\n\nCordialement,`);
            setSelectedTemplateId('');
        }
    }, [isOpen, recipientName]);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);

        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setSubject(template.subject.replace('{contact_name}', recipientName));
                setMessage(template.body.replace('{contact_name}', recipientName));
            }
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, you would call an API here
        console.log('Sending email to:', recipientEmail);
        console.log('Subject:', subject);
        console.log('Message:', message);

        setLoading(false);
        onClose();
        // You could trigger a success toast here if the toast system was available
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Message" size="lg">
            <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-400 w-16">À :</span>
                                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded text-gray-200">
                                    <Mail size={14} />
                                    <span>{recipientName} &lt;{recipientEmail}&gt;</span>
                                </div>
                            </div>
                            {templates.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400" />
                                    <select
                                        value={selectedTemplateId}
                                        onChange={handleTemplateChange}
                                        className="bg-[#1e293b] border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="">Sélectionner un modèle...</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Objet"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Sujet de votre email..."
                        required
                        autoFocus
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-64 bg-[#1e293b] border border-gray-600 rounded-lg p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                            placeholder="Rédigez votre message ici..."
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span> Envoi...
                            </>
                        ) : (
                            <>
                                <Send size={16} className="mr-2" /> Envoyer
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
