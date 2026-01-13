import { useState, useRef } from 'react';
import { Database, Download, Upload, Trash2, Info, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { useBackup } from '../../hooks/useBackup';

export function BackupSection() {
    const { downloadBackup, restoreBackup, getStorageStats, clearAllData } = useBackup();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stats = getStorageStats();

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleDownloadBackup = () => {
        const result = downloadBackup();
        if (result.success) {
            showNotification('success', '✅ Backup téléchargé avec succès!');
        } else {
            showNotification('error', '❌ Erreur lors de la création du backup');
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const confirmed = window.confirm(
            '⚠️ ATTENTION: La restauration remplacera toutes vos données actuelles.\n\n' +
            'Voulez-vous créer un backup de vos données actuelles avant de continuer?'
        );

        if (confirmed) {
            // Create safety backup first
            downloadBackup();
        }

        restoreBackup(
            file,
            (stats) => {
                showNotification(
                    'success',
                    `✅ Backup restauré avec succès! ${stats.pipelinesCount} pipeline(s) et ${stats.leadsCount} lead(s) restaurés.`
                );
                // Reload page to refresh data
                setTimeout(() => window.location.reload(), 1500);
            },
            (error) => {
                showNotification('error', `❌ ${error}`);
            }
        );

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearAllData = () => {
        if (!showClearConfirm) {
            setShowClearConfirm(true);
            return;
        }

        const doubleConfirm = window.confirm(
            'Dernière confirmation!\n\n' +
            'Tapez OK pour supprimer définitivement toutes vos données.'
        );

        if (doubleConfirm) {
            clearAllData();
            showNotification('info', 'Toutes les données ont été supprimées.');
            setShowClearConfirm(false);
            // Reload page to refresh data
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setShowClearConfirm(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Jamais';
        const date = new Date(dateString);
        return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR')}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white">Sauvegarde des données</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Exportez ou importez toutes vos données (pipelines et leads) au format JSON
                    </p>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`p-4 rounded-lg border ${
                        notification.type === 'success'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : notification.type === 'error'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    } flex items-start gap-3 animate-in slide-in-from-top duration-300`}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" />
                    ) : notification.type === 'error' ? (
                        <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
                    ) : (
                        <Info size={20} className="mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{notification.message}</p>
                </div>
            )}

            {/* Backup Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Download Backup Card */}
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-accent-blue/10 rounded-lg">
                            <Download size={24} className="text-accent-blue" />
                        </div>
                        <div>
                            <h4 className="text-base font-medium text-white">Backup complet (JSON)</h4>
                            <p className="text-xs text-gray-400">Sauvegardez TOUS vos pipelines et leads</p>
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadBackup}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all shadow-lg shadow-green-600/20"
                    >
                        <Database size={18} />
                        Télécharger le backup
                    </button>

                    <p className="text-xs text-gray-500 italic flex items-center gap-2">
                        <Info size={12} />
                        Recommandé de faire un backup hebdomadaire!
                    </p>
                </div>

                {/* Restore Backup Card */}
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600/10 rounded-lg">
                            <Upload size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-base font-medium text-white">Restaurer un backup</h4>
                            <p className="text-xs text-gray-400">Importez un fichier de sauvegarde JSON</p>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <button
                        onClick={handleRestoreClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg transition-all shadow-lg shadow-accent-blue/20"
                    >
                        <Upload size={18} />
                        Importer un backup
                    </button>

                    <p className="text-xs text-orange-400 italic flex items-center gap-2">
                        <AlertTriangle size={12} />
                        Cela remplacera toutes vos données actuelles
                    </p>
                </div>
            </div>

            {/* Storage Statistics */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
                <h4 className="text-base font-medium text-white flex items-center gap-2">
                    <Database size={18} />
                    Statistiques de stockage
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Pipelines stockés</div>
                        <div className="text-2xl font-bold text-white">{stats.pipelinesCount}</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Leads stockés</div>
                        <div className="text-2xl font-bold text-white">{stats.leadsCount}</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                            <Calendar size={12} />
                            Dernier backup
                        </div>
                        <div className="text-sm font-medium text-white mt-1">
                            {formatDate(stats.lastBackup)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-400" />
                    <h4 className="text-base font-medium text-red-400">Zone dangereuse</h4>
                </div>

                <p className="text-sm text-gray-400">
                    Ces actions sont <strong className="text-white">irréversibles</strong>.
                </p>

                <button
                    onClick={handleClearAllData}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        showClearConfirm
                            ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                    }`}
                >
                    <Trash2 size={18} />
                    {showClearConfirm ? 'Cliquez à nouveau pour confirmer' : 'Supprimer toutes les données'}
                </button>

                {showClearConfirm && (
                    <p className="text-xs text-red-400 text-center animate-in fade-in duration-300">
                        ⚠️ Êtes-vous absolument sûr? Cette action ne peut pas être annulée!
                    </p>
                )}
            </div>
        </div>
    );
}
