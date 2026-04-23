/**
 * Génère un lien Gmail compose qui force un compte spécifique, en passant
 * d'abord par l'écran Google AccountChooser.
 *
 * Pourquoi AccountChooser plutôt que /u/<email>/ ou /a/<domaine>/ :
 * quand plusieurs comptes Google sont connectés dans Chrome, les routes
 * /u/ et /a/ sont parfois ignorées — Chrome retombe sur le compte par
 * défaut du navigateur. AccountChooser avec `Email=` force explicitement
 * la sélection du compte côté Google avant de rediriger vers l'URL
 * `continue`, ce qui est 100 % fiable.
 *
 * Comportement :
 *   - Si Chrome a déjà ce compte connecté → redirection transparente vers
 *     Gmail compose sur ce compte.
 *   - Sinon → écran officiel « Continuer avec … » pour valider.
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
  // URL Gmail compose "pure", sans préfixe de compte — c'est AccountChooser
  // qui décidera sur quel compte l'ouvrir.
  const gmailParams = new URLSearchParams();
  gmailParams.set('view', 'cm');
  gmailParams.set('fs', '1');
  gmailParams.set('to', to);
  if (subject) gmailParams.set('su', subject);
  if (body) gmailParams.set('body', body);
  if (cc) gmailParams.set('cc', cc);
  if (bcc) gmailParams.set('bcc', bcc);
  const gmailUrl = `https://mail.google.com/mail/?${gmailParams.toString()}`;

  // AccountChooser : Email= force le compte, continue= redirige après.
  const chooserParams = new URLSearchParams();
  chooserParams.set('Email', as);
  chooserParams.set('continue', gmailUrl);
  return `https://accounts.google.com/AccountChooser?${chooserParams.toString()}`;
}
