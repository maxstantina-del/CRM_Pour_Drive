import { Modal, Button, Badge } from '../ui';
import { Lead } from '../../lib/types';
import { Building2, Mail, Phone, Globe, Linkedin, Calendar, MapPin, Tag, DollarSign, Sparkles, Copy, Check, AlertCircle, QrCode, ExternalLink, Hash } from 'lucide-react';
import { ensureUrlProtocol } from '../../lib/utils';
import { EmailComposeModal } from './EmailComposeModal';
import { useState } from 'react';
import { useIceBreaker } from '../../hooks/useIceBreaker';
import { QRCodeCanvas } from 'qrcode.react';

interface LeadDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
}

function IceBreakerUI({ lead }: { lead: Lead }) {
    const { settings, generateIceBreaker } = useIceBreaker();
    const [generatedText, setGeneratedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!settings.enabled) return null;

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            const result = await generateIceBreaker(lead);

            if (result.success && result.text) {
                setGeneratedText(result.text);
            } else {
                setError(result.error || 'Erreur inconnue');
            }
        } catch (error) {
            console.error(error);
            setError('Une erreur est survenue lors de la génération');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-6 p-1 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <div className="bg-[#1e293b]/90 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                        <Sparkles size={16} />
                        Ice Breaker AI
                    </h3>
                    {!generatedText && !error && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30"
                        >
                            {loading ? 'Analyse...' : 'Générer'}
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium mb-1">Erreur de génération</p>
                            <p className="text-xs text-red-200">{error}</p>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    setError(null);
                                    handleGenerate();
                                }}
                                className="mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
                            >
                                Réessayer
                            </Button>
                        </div>
                    </div>
                )}

                {generatedText && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-black/20 rounded-lg p-3 text-gray-200 text-sm italic mb-2 border border-white/5">
                            "{generatedText}"
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setGeneratedText('')}>
                                Recommencer
                            </Button>
                            <Button size="sm" onClick={handleCopy}>
                                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                                {copied ? 'Copié !' : 'Copier'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [showQR, setShowQR] = useState(false);

    if (!lead) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const detailItems: { label: string; value?: string; isLink?: boolean }[] = [
        { label: 'Nom du contact', value: lead.contactName },
        { label: 'Poste', value: lead.jobTitle },
        { label: 'Email', value: lead.email },
        { label: 'Tel. (Fixe)', value: lead.phone },
        { label: 'Tel. (Mobile)', value: lead.mobile },
        { label: 'Entreprise', value: lead.company },
        { label: 'SIRET', value: lead.siret },
        { label: 'Adresse', value: lead.address },
        { label: 'Code postal', value: lead.postalCode },
        { label: 'Ville', value: lead.city },
        { label: 'Pays', value: lead.country },
        { label: 'Source', value: lead.source },
        { label: 'Site Web', value: lead.website, isLink: true },
        { label: 'LinkedIn', value: lead.linkedin, isLink: true },
        { label: 'Lien Offre', value: lead.offerUrl, isLink: true },
        { label: 'Etape', value: lead.stage },
        { label: 'Prochaine action', value: lead.nextAction },
        { label: 'Date action', value: lead.nextActionDate ? formatDate(lead.nextActionDate) : undefined },
        { label: 'Heure action', value: lead.nextActionTime },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Détails du Lead" size="lg">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-100">{lead.name}</h2>
                        {lead.contactName && <p className="text-lg text-gray-200 mt-1">{lead.contactName}</p>}
                        {lead.jobTitle && <p className="text-gray-400 text-sm mt-0.5">{lead.jobTitle}</p>}
                    </div>
                    <Badge variant={lead.stage}>{lead.stage}</Badge>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company & Contact */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>

                        {lead.contactName && (
                            <div className="flex items-center gap-3 text-gray-200">
                                <span className="font-medium text-white">{lead.contactName}</span>
                            </div>
                        )}

                        {lead.company && (
                            <div className="flex items-center gap-3 text-gray-200">
                                <Building2 size={18} className="text-gray-400" />
                                <span>{lead.company}</span>
                            </div>
                        )}

                        {lead.email && (
                            <div className="flex items-center gap-3 text-gray-200">
                                <Mail size={18} className="text-gray-400" />
                                <a href={`mailto:${lead.email}`} className="hover:text-accent-blue transition-colors">
                                    {lead.email}
                                </a>
                            </div>
                        )}

                        <div className="space-y-2">
                            {lead.phone && (
                                <div className="flex items-center gap-3 text-gray-200">
                                    <Phone size={18} className="text-gray-400" />
                                    <a href={`tel:${lead.phone}`} className="hover:text-accent-blue transition-colors">
                                        {lead.phone}
                                    </a>
                                </div>
                            )}
                            {lead.mobile && (
                                <div className="flex items-center gap-3 text-gray-200 ml-8">
                                    <span className="text-xs text-gray-500">Mobile:</span>
                                    <a href={`tel:${lead.mobile}`} className="hover:text-accent-blue transition-colors">
                                        {lead.mobile}
                                    </a>
                                </div>
                            )}
                            {lead.phone && (
                                <div className="mt-3 pl-8">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setShowQR(!showQR)}
                                        className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30"
                                    >
                                        <QrCode size={14} className="mr-1" />
                                        {showQR ? 'Masquer' : 'Afficher'} QR Code
                                    </Button>
                                    {showQR && (
                                        <div className="mt-3 flex flex-col items-center p-4 bg-white/5 rounded-lg border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="bg-white p-2 rounded-lg">
                                                <QRCodeCanvas
                                                    value={`tel:${lead.phone}`}
                                                    size={150}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Scanner pour appeler directement</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {(lead.address || lead.postalCode || lead.city || lead.country) && (
                            <div className="flex items-start gap-3 text-gray-200">
                                <MapPin size={18} className="text-gray-400 mt-1" />
                                <div>
                                    {lead.address && <p>{lead.address}</p>}
                                    {(lead.postalCode || lead.city) && (
                                        <p>{[lead.postalCode, lead.city].filter(Boolean).join(' ')}</p>
                                    )}
                                    {lead.country && <p>{lead.country}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Business Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Affaire</h3>

                        <div className="flex items-center gap-3 text-gray-200">
                            <div className="p-2 bg-accent-green/10 rounded-lg">
                                <DollarSign size={20} className="text-accent-green" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Valeur estimée</p>
                                <p className="text-lg font-semibold text-accent-green">{formatCurrency(lead.value)}</p>
                            </div>
                        </div>

                        {lead.source && (
                            <div className="flex items-center gap-3 text-gray-200">
                                <Tag size={18} className="text-gray-400" />
                                <span>Source: {lead.source}</span>
                            </div>
                        )}

                        {lead.siret && (
                            <div className="flex items-center gap-3 text-gray-200">
                                <Hash size={18} className="text-gray-400" />
                                <span>SIRET: {lead.siret}</span>
                            </div>
                        )}

                        <div className="flex gap-4 pt-2">
                            {lead.website && (
                                <a
                                    href={ensureUrlProtocol(lead.website)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <Globe size={16} /> Site Web
                                </a>
                            )}
                            {lead.linkedin && (
                                <a
                                    href={ensureUrlProtocol(lead.linkedin)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <Linkedin size={16} /> LinkedIn
                                </a>
                            )}
                            {lead.offerUrl && (
                                <a
                                    href={ensureUrlProtocol(lead.offerUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <ExternalLink size={16} /> Offre
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Action */}
                {(lead.nextAction || lead.nextActionDate) && (
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Prochaine action</h3>
                        <div className="flex flex-wrap gap-6 text-gray-200">
                            {lead.nextAction && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{lead.nextAction}</span>
                                    {lead.nextAction?.trim().toLowerCase() === 'email' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="ml-2 py-0.5 px-2 h-auto text-xs"
                                            onClick={() => {
                                                if (lead.email) {
                                                    setIsEmailModalOpen(true);
                                                }
                                            }}
                                            disabled={!lead.email}
                                            title={!lead.email ? "Aucun email renseigné" : "Envoyer un email"}
                                        >
                                            <Mail size={12} className="mr-1" />
                                            Envoyer
                                        </Button>
                                    )}
                                </div>
                            )}
                            {(lead.nextActionDate || lead.nextActionTime) && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-400" />
                                    <span>
                                        {formatDate(lead.nextActionDate)}
                                        {lead.nextActionTime ? ` à ${lead.nextActionTime}` : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Ice Breaker Section */}
                <IceBreakerUI lead={lead} />

                {/* Notes */}
                {lead.notes && (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                        <div className="p-4 bg-black/20 rounded-xl text-gray-300 border border-white/5 whitespace-pre-wrap">
                            {lead.notes}
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Donnees importees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {detailItems.map((item) => (
                            <div key={item.label} className="bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                                <div className="text-[11px] uppercase tracking-wider text-gray-500">{item.label}</div>
                                <div className="text-sm text-gray-200">
                                    {item.isLink && item.value ? (
                                        <a
                                            href={ensureUrlProtocol(item.value)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-300 hover:text-indigo-200 transition-colors break-all"
                                        >
                                            {item.value}
                                        </a>
                                    ) : (
                                        item.value || '-'
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 pt-4 border-t border-white/5 flex justify-between">
                    <span>ID: {lead.id}</span>
                    <span>Créé le {formatDate(lead.created_at)}</span>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>Fermer</Button>
                </div>
            </div>

            <EmailComposeModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                recipientEmail={lead.email || ''}
                recipientName={lead.contactName || lead.name || ''}
            />
        </Modal>
    );
}
