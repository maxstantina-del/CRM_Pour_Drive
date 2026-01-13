import { useState } from 'react';
import { UserProfileSection } from '../settings/UserProfileSection';
import { TeamSection } from '../settings/TeamSection';
import { BackupSection } from '../settings/BackupSection';
import { EmailTemplatesSection } from '../settings/EmailTemplatesSection';
import { IceBreakerSection } from '../settings/IceBreakerSection';
import { Modal } from '../ui';
import { User, Users, Mail, Database, ChevronRight, Sparkles } from 'lucide-react';

export function SettingsView() {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const sections = [
        {
            id: 'profile',
            title: 'Mon Profil',
            description: 'Gérez vos informations personnelles et vos préférences.',
            icon: User,
            component: UserProfileSection,
            color: 'bg-blue-500/20 text-blue-400'
        },
        {
            id: 'team',
            title: 'Équipe',
            description: 'Gérez les membres de votre équipe et leurs permissions.',
            icon: Users,
            component: TeamSection,
            color: 'bg-purple-500/20 text-purple-400'
        },
        {
            id: 'icebreaker',
            title: 'Ice Breaker AI',
            description: 'Configurez la génération automatique de messages d\'approche.',
            icon: Sparkles,
            component: IceBreakerSection,
            color: 'bg-indigo-500/20 text-indigo-400'
        },
        {
            id: 'templates',
            title: 'Modèles d\'emails',
            description: 'Créez et modifiez vos modèles d\'emails types.',
            icon: Mail,
            component: EmailTemplatesSection,
            color: 'bg-green-500/20 text-green-400'
        },
        {
            id: 'backup',
            title: 'Sauvegardes',
            description: 'Gérez les sauvegardes et la restauration des données.',
            icon: Database,
            component: BackupSection,
            color: 'bg-orange-500/20 text-orange-400'
        }
    ];

    const ActiveComponent = activeSection ? sections.find(s => s.id === activeSection)?.component : null;

    return (
        <div className="px-8 pb-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Réglages</h1>
                <p className="text-gray-400">Gérez tous les paramètres de votre CRM.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="group relative flex flex-col items-start p-6 glass rounded-2xl border border-white/5 hover:border-accent-blue/50 transition-all duration-300 text-left hover:bg-white/5"
                    >
                        <div className={`p-3 rounded-xl mb-4 ${section.color}`}>
                            <section.icon size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">{section.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">{section.description}</p>
                        <div className="mt-auto flex items-center text-sm font-medium text-accent-blue opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 transition-transform">
                            Ouvrir <ChevronRight size={16} className="ml-1" />
                        </div>
                    </button>
                ))}
            </div>

            {activeSection && ActiveComponent && (
                <Modal
                    isOpen={!!activeSection}
                    onClose={() => setActiveSection(null)}
                    title={sections.find(s => s.id === activeSection)?.title || ''}
                    size="xl"
                >
                    <ActiveComponent />
                </Modal>
            )}
        </div>
    );
}
