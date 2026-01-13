import { useState, useEffect } from 'react';
import { UserProfile } from '../lib/types';
import { getSetting, setSetting } from '../lib/db';

const DEFAULT_PROFILE: UserProfile = {
    name: 'Utilisateur',
    email: 'utilisateur@example.com',
    company: 'Ma Société',
    role: 'Admin'
};

const STORAGE_KEY = 'crm_user_profile';

export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

    useEffect(() => {
        async function loadData() {
            const saved = await getSetting(STORAGE_KEY);
            if (saved) {
                setProfile(JSON.parse(saved));
            }
        }
        loadData();
    }, []);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        const newProfile = { ...profile, ...updates };
        await setSetting(STORAGE_KEY, JSON.stringify(newProfile));
        setProfile(newProfile);
    };

    return {
        profile,
        updateProfile
    };
}
