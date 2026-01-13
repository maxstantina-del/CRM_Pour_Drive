import { useState, useEffect } from 'react';
import { Target, Phone, Calendar, FileText, Handshake, TrendingUp, XCircle, User, Users, Mail, MessageCircle, CheckCircle, Clock, AlertCircle, Ban, Star, Heart, Zap, HelpCircle } from 'lucide-react';
import { Stage, StageConfig } from '../lib/types';
import { getSetting, setSetting } from '../lib/db';

// Icon mapping for persistence
export const STAGE_ICONS: Record<string, any> = {
    Target, Phone, Calendar, FileText, Handshake, TrendingUp, XCircle,
    User, Users, Mail, MessageCircle, CheckCircle, Clock, AlertCircle,
    Ban, Star, Heart, Zap, HelpCircle
};

export const DEFAULT_STAGES: StageConfig[] = [
    { id: 'new', label: 'Nouveau', icon: 'Target', color: 'blue' },
    { id: 'contact', label: 'Contacté', icon: 'Phone', color: 'yellow' },
    { id: 'meeting', label: 'RDV Planifié', icon: 'Calendar', color: 'purple' },
    { id: 'proposal', label: 'Proposition', icon: 'FileText', color: 'indigo' },
    { id: 'negotiation', label: 'Négociation', icon: 'Handshake', color: 'pink' },
    { id: 'won', label: 'Gagné', icon: 'TrendingUp', color: 'green' },
    { id: 'lost', label: 'Perdu', icon: 'XCircle', color: 'red' },
];

const STORAGE_KEY = 'crm_stages_v1';

export function usePipelineStages() {
    const [stages, setStages] = useState<StageConfig[]>(DEFAULT_STAGES);

    useEffect(() => {
        async function loadData() {
            const saved = await getSetting(STORAGE_KEY);
            let initialStages = saved ? JSON.parse(saved) : DEFAULT_STAGES;

            // Critical: Migrate legacy IDs immediately
            let hasChanges = false;
            initialStages = initialStages.map((s: StageConfig) => {
                if (s.id === 'closed_won') { hasChanges = true; return { ...s, id: 'won' }; }
                if (s.id === 'closed_lost') { hasChanges = true; return { ...s, id: 'lost' }; }
                return s;
            });

            if (hasChanges) {
                await setSetting(STORAGE_KEY, JSON.stringify(initialStages));
            }

            setStages(initialStages);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (stages !== DEFAULT_STAGES) { // Avoid saving on first render
            setSetting(STORAGE_KEY, JSON.stringify(stages));
        }
    }, [stages]);

    const addStage = (label: string) => {
        const id = label.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
        const newStage: StageConfig = {
            id,
            label,
            icon: 'Target', // Default icon
            color: 'gray'
        };
        setStages(prev => [...prev, newStage]);
        return id;
    };

    const updateStage = (id: string, updates: Partial<StageConfig>) => {
        setStages(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteStage = (id: string) => {
        setStages(prev => prev.filter(s => s.id !== id));
    };

    const reorderStages = (newOrder: StageConfig[]) => {
        setStages(newOrder);
    };

    const getStageConfig = (id: Stage) => {
        return stages.find(s => s.id === id) || {
            id,
            label: id,
            icon: 'HelpCircle',
            color: 'gray'
        };
    };

    return {
        stages,
        addStage,
        updateStage,
        deleteStage,
        reorderStages,
        getStageConfig
    };
}
