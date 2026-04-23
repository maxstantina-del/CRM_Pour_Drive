/**
 * Generates a Gmail compose URL that forces a specific account (via the
 * `/u/<email>/` path). Falls back to mailto: if the target user doesn't have
 * a configured Gmail account.
 *
 * Comportement attendu :
 *   - Clic sur l'email d'un lead → onglet Gmail avec le bon expéditeur
 *     (stantina-max@chosen-mx.com) pré-rempli pour envoyer au destinataire.
 *   - Si Gmail n'est pas connecté à ce compte dans le navigateur, Google
 *     demande de s'y connecter avant d'afficher la fenêtre de composition.
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
  if (subject) params.set('su', subject);
  if (body) params.set('body', body);
  if (cc) params.set('cc', cc);
  if (bcc) params.set('bcc', bcc);
  // /u/<email>/ force l'utilisation de ce compte Gmail. Si pas connecté,
  // Google propose de se connecter avant d'ouvrir le compose.
  return `https://mail.google.com/mail/u/${encodeURIComponent(as)}/?${params.toString()}`;
}
