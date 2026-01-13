import { useIceBreaker, IceBreakerSettings } from '../../hooks/useIceBreaker';
import { useFeatureAccess } from '../../hooks/useLicense';
import { IceBreakerGuideModal } from '../modals/IceBreakerGuideModal';
import { Button, Input } from '../ui';
import { Sparkles, Save, CheckCircle, AlertCircle, ExternalLink, Info, Key, Lock, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

export function IceBreakerSection() {
    const { settings, updateSettings, testApiKey } = useIceBreaker();
    const { hasAccess, reason } = useFeatureAccess('icebreaker');
    const [formData, setFormData] = useState<IceBreakerSettings>(settings);
    const [isDirty, setIsDirty] = useState(false);
    const [testingKey, setTestingKey] = useState(false);
    const [keyTestResult, setKeyTestResult] = useState<{ valid: boolean; error?: string } | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (field: keyof IceBreakerSettings, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        // Reset test result when key changes
        if (field === 'apiKey') {
            setKeyTestResult(null);
        }
    };

    const handleTestKey = async () => {
        if (!formData.apiKey || formData.apiKey.trim() === '') {
            setKeyTestResult({ valid: false, error: 'Veuillez entrer une clé API' });
            return;
        }

        setTestingKey(true);
        setKeyTestResult(null);

        try {
            const result = await testApiKey(formData.apiKey);
            setKeyTestResult(result);
        } catch (error) {
            setKeyTestResult({ valid: false, error: 'Erreur de connexion' });
        } finally {
            setTestingKey(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        setIsDirty(false);
    };

    return (
        <div className="space-y-6">
            {/* Blocage si pas d'accès */}
            {!hasAccess && (
                <div className="mb-6 p-6 bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border-2 border-indigo-500/30 rounded-xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-lg">
                            <Lock size={24} className="text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">Fonctionnalité Premium</h3>
                            <p className="text-gray-300 mb-4">{reason}</p>
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                                    <p className="text-green-300 font-semibold">39,99€ - Accès à vie</p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        // Ouvre le modal d'activation (géré par App.tsx)
                                        window.dispatchEvent(new CustomEvent('openLicenseModal'));
                                    }}
                                >
                                    Débloquer Ice Breaker AI
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex items-center justify-between mb-6 ${!hasAccess ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-100">Ice Breaker AI</h2>
                        <p className="text-sm text-gray-400">Générez des accroches personnalisées grâce à l'IA.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg transition-colors text-sm"
                    >
                        <Info size={16} />
                        {showGuide ? 'Masquer' : 'Config API'}
                    </button>
                    <button
                        onClick={() => setShowGuideModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg transition-colors text-sm"
                    >
                        <BookOpen size={16} />
                        Guide d'utilisation
                    </button>
                </div>
            </div>

            {/* Guide Section */}
            {showGuide && (
                <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold text-indigo-200 flex items-center gap-2">
                        <Key size={20} />
                        Comment obtenir votre clé API OpenAI ?
                    </h3>

                    <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                            <div>
                                <p className="font-medium">Créez un compte OpenAI</p>
                                <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                                    platform.openai.com/signup <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                            <div>
                                <p className="font-medium">Allez dans "API Keys"</p>
                                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                                    platform.openai.com/api-keys <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                            <div>
                                <p className="font-medium">Cliquez "Create new secret key"</p>
                                <p className="text-gray-400 mt-1">Copiez la clé (elle commence par "sk-")</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</span>
                            <div>
                                <p className="font-medium">Collez la clé ci-dessous</p>
                                <p className="text-gray-400 mt-1">C'est tout ! Vous êtes prêt à générer des ice breakers.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-4 mt-4">
                        <p className="text-sm text-green-300 font-medium mb-2">💰 Coût ultra-bas</p>
                        <p className="text-xs text-gray-300">
                            Avec GPT-4o-mini: ~0,01 centime par accroche générée<br />
                            1000 accroches = environ 0,30€
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Enable Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <input
                        type="checkbox"
                        id="enabled"
                        checked={formData.enabled}
                        onChange={(e) => handleChange('enabled', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    <label htmlFor="enabled" className="text-gray-200 font-medium">
                        Activer Ice Breaker AI
                    </label>
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Clé API OpenAI *</label>
                    <div className="flex gap-2">
                        <Input
                            value={formData.apiKey}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                            placeholder="sk-proj-..."
                            type="password"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleTestKey}
                            disabled={testingKey || !formData.apiKey}
                        >
                            {testingKey ? 'Test...' : 'Tester'}
                        </Button>
                    </div>

                    {/* Test Result */}
                    {keyTestResult && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                            keyTestResult.valid
                                ? 'bg-green-950/30 border border-green-500/30 text-green-300'
                                : 'bg-red-950/30 border border-red-500/30 text-red-300'
                        }`}>
                            {keyTestResult.valid ? (
                                <>
                                    <CheckCircle size={16} />
                                    <span>Clé valide ! Vous pouvez générer des ice breakers.</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={16} />
                                    <span>{keyTestResult.error || 'Clé invalide'}</span>
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        Votre clé est stockée localement et jamais partagée.
                    </p>
                </div>

                {/* Tone Selector */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Ton de communication</label>
                    <select
                        value={formData.tone}
                        onChange={(e) => handleChange('tone', e.target.value as any)}
                        className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="professional">Professionnel (recommandé pour B2B)</option>
                        <option value="casual">Décontracté (approche amicale)</option>
                        <option value="enthusiastic">Enthousiaste (énergique et inspirant)</option>
                    </select>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Instructions personnalisées (optionnel)</label>
                    <textarea
                        value={formData.customPrompt}
                        onChange={(e) => handleChange('customPrompt', e.target.value)}
                        className="w-full h-24 bg-[#1e293b] border border-gray-600 rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Ex: Mentionne toujours un élément concret du site web..."
                    />
                    <p className="text-xs text-gray-500">
                        Guidez l'IA sur comment personnaliser les accroches selon vos préférences.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-white/5">
                    <Button type="submit" disabled={!isDirty}>
                        <Save size={18} className="mr-2" />
                        Enregistrer les préférences
                    </Button>
                </div>
            </form>

            {/* Guide Modal */}
            <IceBreakerGuideModal
                isOpen={showGuideModal}
                onClose={() => setShowGuideModal(false)}
            />
        </div>
    );
}
