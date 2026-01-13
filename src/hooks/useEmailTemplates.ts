import { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../lib/db';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

const STORAGE_KEY = 'crm_email_templates';

// Predefined templates to help user get started
const DEFAULT_TEMPLATES: EmailTemplate[] = [
    {
        id: 'tpl_intro',
        name: 'Premier contact',
        subject: 'Introduction - [Votre Entreprise]',
        body: 'Bonjour {contact_name},\n\nJe me permets de vous contacter suite à...\n\nCordialement,'
    },
    {
        id: 'tpl_followup',
        name: 'Relance J+3',
        subject: 'Concernant notre échange',
        body: 'Bonjour {contact_name},\n\nJe reviens vers vous concernant notre dernier échange.\n\nAvez-vous eu le temps de...\n\nBien à vous,'
    }
];

export function useEmailTemplates() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);

    useEffect(() => {
        async function loadData() {
            const stored = await getSetting(STORAGE_KEY);
            if (stored) {
                try {
                    setTemplates(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse email templates', e);
                    setTemplates(DEFAULT_TEMPLATES);
                }
            } else {
                setTemplates(DEFAULT_TEMPLATES);
            }
        }
        loadData();
    }, []);

    const saveTemplates = async (newTemplates: EmailTemplate[]) => {
        setTemplates(newTemplates);
        await setSetting(STORAGE_KEY, JSON.stringify(newTemplates));
    };

    const addTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
        const newTemplate = { ...template, id: crypto.randomUUID() };
        await saveTemplates([...templates, newTemplate]);
    };

    const updateTemplate = async (id: string, updates: Partial<Omit<EmailTemplate, 'id'>>) => {
        const newTemplates = templates.map(t =>
            t.id === id ? { ...t, ...updates } : t
        );
        await saveTemplates(newTemplates);
    };

    const deleteTemplate = async (id: string) => {
        const newTemplates = templates.filter(t => t.id !== id);
        await saveTemplates(newTemplates);
    };

    return {
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate
    };
}
