import { useState, type FormEvent } from 'react';
import { LogIn, Mail, KeyRound, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Mode = 'signin' | 'signup' | 'magic';

export function LoginPage() {
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let result: { error: string | null };
    if (mode === 'signin') result = await signInWithPassword(email, password);
    else if (mode === 'signup') result = await signUpWithPassword(email, password);
    else {
      result = await signInWithMagicLink(email);
      if (!result.error) setMagicSent(true);
    }

    if (result.error) setError(result.error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-3">
            <LogIn className="w-7 h-7 text-indigo-600 dark:text-indigo-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'signup' ? 'Créer un compte' : 'Connexion CRM'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accès réservé à votre équipe.
          </p>
        </div>

        {magicSent ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 text-center">
            <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-300 mx-auto mb-2" />
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              Lien envoyé à <strong>{email}</strong>. Vérifie ta boîte mail.
            </p>
            <button
              onClick={() => {
                setMagicSent(false);
                setMode('signin');
              }}
              className="mt-4 text-sm text-emerald-700 dark:text-emerald-300 underline"
            >
              Retour
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {mode !== 'magic' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signup' ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {mode === 'signup' ? 'Créer le compte' : mode === 'magic' ? 'Envoyer le lien' : 'Se connecter'}
            </button>

            <div className="flex flex-col gap-2 text-sm text-center pt-2">
              {mode === 'signin' && (
                <>
                  <button type="button" onClick={() => setMode('magic')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Recevoir un lien magique par email
                  </button>
                  <button type="button" onClick={() => setMode('signup')} className="text-slate-500 dark:text-slate-400 hover:underline">
                    Pas encore de compte ? Créer un compte
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button type="button" onClick={() => setMode('signin')} className="text-slate-500 dark:text-slate-400 hover:underline">
                  Déjà un compte ? Se connecter
                </button>
              )}
              {mode === 'magic' && (
                <button type="button" onClick={() => setMode('signin')} className="text-slate-500 dark:text-slate-400 hover:underline">
                  Utiliser email + mot de passe
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
