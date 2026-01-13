import { useState } from 'react';
import { User, Mail, Building, Briefcase, Camera, Check, MapPin } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { JOB_TITLES, SECTORS } from '../../constants/profileOptions';

export function UserProfileSection() {
    const { profile, updateProfile } = useUserProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profile);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Profil Utilisateur</h3>
                <button
                    onClick={() => {
                        if (isEditing) {
                            setFormData(profile); // Reset on cancel
                        }
                        setIsEditing(!isEditing);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20'
                        }`}
                >
                    {isEditing ? 'Annuler' : 'Modifier'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-accent-blue/20">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                profile.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 p-1.5 bg-gray-800 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-white transition-colors"
                                title="Changer la photo"
                            >
                                <Camera size={14} />
                            </button>
                        )}
                    </div>
                    <div>
                        <h4 className="text-lg font-medium text-white">{profile.name}</h4>
                        <div className="flex flex-col gap-1 text-sm text-gray-400">
                            <span className="flex items-center gap-2">
                                <Briefcase size={12} />
                                {profile.role || 'Poste non défini'}
                            </span>
                            {profile.sector && (
                                <span className="flex items-center gap-2">
                                    <Building size={12} />
                                    {profile.sector}
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <MapPin size={12} />
                                {profile.company}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Nom complet</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                disabled={!isEditing}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Entreprise</label>
                        <div className="relative">
                            <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.company}
                                onChange={(e) => handleChange('company', e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Poste</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            {isEditing ? (
                                <select
                                    value={formData.role || ''}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 appearance-none transition-all"
                                >
                                    <option value="" disabled>Sélectionner un poste</option>
                                    {JOB_TITLES.map(title => (
                                        <option key={title} value={title} className="bg-gray-800 text-white">
                                            {title}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    disabled
                                    value={formData.role || ''}
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Secteur d'activité</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            {isEditing ? (
                                <select
                                    value={formData.sector || ''}
                                    onChange={(e) => handleChange('sector', e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 appearance-none transition-all"
                                >
                                    <option value="" disabled>Sélectionner un secteur</option>
                                    {SECTORS.map(sector => (
                                        <option key={sector} value={sector} className="bg-gray-800 text-white">
                                            {sector}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    disabled
                                    value={formData.sector || ''}
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg transition-all shadow-lg shadow-accent-blue/20"
                        >
                            <Check size={18} />
                            Enregistrer
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
