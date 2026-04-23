/**
 * Generates a Gmail compose URL that forces a specific Google Workspace
 * account using the /a/<domain>/ pattern — seul URL fiable quand plusieurs
 * comptes Gmail sont connectés dans le même navigateur.
 *
 * Comportement attendu :
 *   - Clic sur l'email d'un lead → onglet Gmail avec l'expéditeur
 *     stantina-max@chosen-mx.com pré-rempli pour envoyer au destinataire.
 *   - Google route automatiquement vers le compte du domaine chosen-mx.com
 *     même si un compte @gmail.com perso est par défaut dans Chrome.
 */

const DEFAULT_SENDER = 'stantina-max@chosen-mx.com';

export interface GmailComposeOptions {
  to: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
  /** Override du compte expéditeur. Par défaut DEFAULT_SENDER. */
  as?: string;
}

/**
 * Extrait le domaine de l'email : stantina-max@chosen-mx.com → chosen-mx.com
 * Pour les adresses @gmail.com on utilise /u/<email>/ car il n'y a pas de
 * workspace dédié.
 */
function accountPath(email: string): string {
  const at = email.indexOf('@');
  if (at < 0) return `u/${encodeURIComponent(email)}`;
  const domain = email.slice(at + 1).toLowerCase();
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `u/${encodeURIComponent(email)}`;
  }
  // Workspace domain → /a/<domain>/ est la route fiable
  return `a/${encodeURIComponent(domain)}`;
}

export function gmailComposeUrl({
  to,
  subject,
  body,
  cc,
  bcc,
  as = DEFAULT_SENDER,
}: GmailComposeOptions): string {
  const params = new URLSearchParams();
  params.set('view', 'cm');
  params.set('fs', '1');
  params.set('to', to);
  // Indique aussi l'expéditeur via authuser — redondant mais Google utilise
  // l'un ou l'autre selon l'état de session.
  params.set('authuser', as);
  if (subject) params.set('su', subject);
  if (body) params.set('body', body);
  if (cc) params.set('cc', cc);
  if (bcc) params.set('bcc', bcc);
  return `https://mail.google.com/mail/${accountPath(as)}/?${params.toString()}`;
}
