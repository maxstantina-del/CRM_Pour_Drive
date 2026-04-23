import React, { useEffect, useState } from 'react';
import { Mail, Save, Check, ExternalLink } from 'lucide-react';
import { Button } from '../ui';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { useToast } from '../../contexts/ToastContext';

/**
 * Paramétrage du preset email : objet + corps + lien pièce jointe optionnel.
 * Au clic sur l'email d'un lead, Gmail s'ouvrira avec ces valeurs pré-remplies.
 */
export function EmailPresetSection() {
  const { prefs, update } = useUserPreferences();
  const { showToast } = useToast();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Synchronise le form avec les prefs chargées (y compris quand elles arrivent
  // en retard depuis Supabase ou via realtime).
  useEffect(() => {
    setSubject(prefs?.emailSubject ?? '');
    setBody(prefs?.emailBody ?? '');
    setAttachmentUrl(prefs?.emailAttachmentUrl ?? '');
  }, [prefs]);

  const dirty =
    (prefs?.emailSubject ?? '') !== subject ||
    (prefs?.emailBody ?? '') !== body ||
    (prefs?.emailAttachmentUrl ?? '') !== attachmentUrl;

  const save = async () => {
    setSaving(true);
    try {
      await update({
        emailSubject: subject.trim() || null,
        emailBody: body.trim() || null,
        emailAttachmentUrl: attachmentUrl.trim() || null,
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      showToast('Preset email enregistré', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Erreur : ${msg}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="surface-card p-5 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="heading-sm flex items-center gap-2">
            <Mail size={16} className="text-primary" />
            Mail automatique
          </h2>
          <p className="text-[12px] text-[color:var(--color-text-muted)] mt-1">
            Quand tu cliques sur l'email d'un lead, Gmail s'ouvre avec l'objet,
            le corps et le lien pièce jointe pré-remplis. Tu relis, tu envoies.
          </p>
        </div>
      </header>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-[color:var(--color-text-body)]">Objet</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Proposition partenariat Autoglass"
            className="mt-1 w-full h-9 px-3 text-[13px] rounded-md bg-surface border border-border text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:outline-none focus:border-primary focus:shadow-focus"
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-medium text-[color:var(--color-text-body)]">Corps du mail</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Bonjour,

Suite à notre échange, je me permets de vous transmettre notre proposition…

Cordialement,
Max Stantina
ChosenMX"
            rows={10}
            className="mt-1 w-full px-3 py-2 text-[13px] rounded-md bg-surface border border-border text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:outline-none focus:border-primary focus:shadow-focus resize-y"
          />
          <span className="mt-1 block text-[11px] text-[color:var(--color-text-subtle)]">
            Le texte est pré-rempli tel quel (pas de variables auto).
          </span>
        </label>

        <label className="block">
          <span className="text-[12px] font-medium text-[color:var(--color-text-body)] flex items-center gap-1">
            <ExternalLink size={12} />
            Lien pièce jointe (optionnel)
          </span>
          <input
            type="url"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="https://drive.google.com/…"
            className="mt-1 w-full h-9 px-3 text-[13px] rounded-md bg-surface border border-border text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:outline-none focus:border-primary focus:shadow-focus"
          />
          <span className="mt-1 block text-[11px] text-[color:var(--color-text-subtle)]">
            Lien Drive/Dropbox/WeTransfer — collé automatiquement en bas du corps du mail.
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="primary"
          icon={justSaved ? <Check size={14} /> : <Save size={14} />}
          onClick={save}
          disabled={saving || !dirty}
          loading={saving}
        >
          {justSaved ? 'Enregistré' : 'Enregistrer'}
        </Button>
      </div>
    </section>
  );
}
