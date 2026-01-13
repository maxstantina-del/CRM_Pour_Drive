import { Modal } from '../ui';
import { Sparkles, Phone, Mail, Linkedin, MessageSquare, Lightbulb, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface IceBreakerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IceBreakerGuideModal({ isOpen, onClose }: IceBreakerGuideModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guide Ice Breaker AI" size="xl">
      <div className="space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border border-indigo-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <Sparkles size={24} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Qu'est-ce qu'un Ice Breaker ?</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Un <strong>ice breaker</strong> est une phrase d'accroche personnalisée qui vous permet de débuter une conversation
                avec un prospect de manière naturelle et engageante. Au lieu d'envoyer un message générique,
                l'Ice Breaker AI analyse les informations du lead (entreprise, poste, site web, LinkedIn) et génère
                une approche unique et pertinente.
              </p>
            </div>
          </div>
        </div>

        {/* Cas d'usage */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" />
            Cas d'usage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cold Calling */}
            <div className="glass rounded-xl p-5 border border-white/10 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Phone size={20} className="text-blue-400" />
                </div>
                <h4 className="font-semibold text-white">Cold Calling</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Utilisez l'ice breaker comme introduction lors d'un appel à froid pour capter immédiatement
                l'attention de votre interlocuteur.
              </p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-300 italic">
                  "Bonjour M. Dupont, j'ai remarqué que votre entreprise TechCorp développe actuellement une solution SaaS innovante..."
                </p>
              </div>
            </div>

            {/* Email prospection */}
            <div className="glass rounded-xl p-5 border border-white/10 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Mail size={20} className="text-green-400" />
                </div>
                <h4 className="font-semibold text-white">Email de prospection</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Intégrez l'ice breaker au début de votre email pour augmenter votre taux d'ouverture et de réponse.
              </p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-300 italic">
                  Objet: Re: Votre article sur l'automatisation<br />
                  "Votre article sur LinkedIn concernant l'automatisation des processus m'a vraiment interpellé..."
                </p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="glass rounded-xl p-5 border border-white/10 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Linkedin size={20} className="text-indigo-400" />
                </div>
                <h4 className="font-semibold text-white">Message LinkedIn</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Personnalisez vos demandes de connexion et premiers messages sur LinkedIn pour sortir du lot.
              </p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-300 italic">
                  "Félicitations pour votre récent financement de série A ! J'accompagne des startups comme la vôtre à..."
                </p>
              </div>
            </div>

            {/* Meeting */}
            <div className="glass rounded-xl p-5 border border-white/10 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MessageSquare size={20} className="text-purple-400" />
                </div>
                <h4 className="font-semibold text-white">Premier RDV</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Démarrez votre premier rendez-vous avec un élément de contexte qui montre votre préparation.
              </p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-300 italic">
                  "Avant de commencer, je voulais mentionner que j'ai été impressionné par votre expansion récente en Allemagne..."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bonnes pratiques */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-400" />
            Bonnes pratiques
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-green-950/20 border border-green-500/20 rounded-lg">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300 mb-1">Personnalisation maximale</p>
                <p className="text-sm text-gray-400">
                  Remplissez un maximum d'informations sur le lead (site web, LinkedIn, entreprise) pour obtenir
                  des ice breakers ultra-personnalisés.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-950/20 border border-green-500/20 rounded-lg">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300 mb-1">Adaptez le ton</p>
                <p className="text-sm text-gray-400">
                  Dans les paramètres Ice Breaker, choisissez le ton (Professionnel, Décontracté, Enthousiaste)
                  selon votre secteur et votre cible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-950/20 border border-green-500/20 rounded-lg">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300 mb-1">Utilisez les instructions personnalisées</p>
                <p className="text-sm text-gray-400">
                  Guidez l'IA avec vos préférences (ex: "Mentionne toujours un élément concret du site web")
                  pour des résultats alignés avec votre stratégie.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-950/20 border border-green-500/20 rounded-lg">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300 mb-1">Testez et itérez</p>
                <p className="text-sm text-gray-400">
                  Si l'ice breaker généré ne vous convient pas, cliquez sur "Recommencer" pour en obtenir un nouveau.
                  L'IA apprend de vos préférences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* À éviter */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <XCircle size={20} className="text-red-400" />
            À éviter
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
              <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-300 mb-1">Copier-coller sans relire</p>
                <p className="text-sm text-gray-400">
                  Relisez toujours l'ice breaker généré. L'IA peut parfois faire des erreurs ou mentionner des informations
                  obsolètes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
              <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-300 mb-1">Utiliser le même ice breaker pour tous</p>
                <p className="text-sm text-gray-400">
                  L'objectif est la personnalisation. Générez un nouvel ice breaker pour chaque lead important.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
              <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-300 mb-1">Oublier de remplir les informations du lead</p>
                <p className="text-sm text-gray-400">
                  Plus vous donnez d'informations (site web, LinkedIn, poste), plus l'ice breaker sera pertinent et efficace.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exemples concrets */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Exemples d'ice breakers efficaces</h3>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/20 rounded-lg p-4">
              <p className="text-xs text-blue-300 font-semibold mb-2">💼 B2B SaaS</p>
              <p className="text-sm text-gray-300 italic mb-2">
                "J'ai remarqué que DataCorp a récemment levé 5M€ pour son expansion européenne. Nous avons accompagné
                des scale-ups similaires (comme TechFlow) sur leur stratégie d'acquisition. Seriez-vous ouvert à un
                échange de 15 minutes cette semaine ?"
              </p>
              <p className="text-xs text-gray-500">✅ Personnalisé, concret, appel à l'action clair</p>
            </div>

            <div className="bg-gradient-to-r from-green-950/30 to-emerald-950/30 border border-green-500/20 rounded-lg p-4">
              <p className="text-xs text-green-300 font-semibold mb-2">🏗️ Services B2B</p>
              <p className="text-sm text-gray-300 italic mb-2">
                "Votre article LinkedIn sur l'optimisation des coûts énergétiques dans l'industrie m'a particulièrement
                interpellé. Nous aidons justement des entreprises manufacturières à réduire leur consommation de 20-30%.
                J'aimerais partager quelques insights qui pourraient vous intéresser."
              </p>
              <p className="text-xs text-gray-500">✅ Fait référence à du contenu du prospect, apporte de la valeur</p>
            </div>

            <div className="bg-gradient-to-r from-purple-950/30 to-pink-950/30 border border-purple-500/20 rounded-lg p-4">
              <p className="text-xs text-purple-300 font-semibold mb-2">🚀 Startup / Tech</p>
              <p className="text-sm text-gray-300 italic mb-2">
                "Félicitations pour le lancement de votre nouvelle feature IA sur ProductHunt ! J'accompagne des startups
                en phase de croissance sur leur stratégie go-to-market. Votre approche est vraiment innovante.
                On pourrait échanger 10 minutes ?"
              </p>
              <p className="text-xs text-gray-500">✅ Félicitations sincères, ton enthousiaste, proposition légère</p>
            </div>
          </div>
        </div>

        {/* CTA final */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Prêt à générer votre premier Ice Breaker ?</h3>
          <p className="text-sm text-gray-300 mb-4">
            Ouvrez la fiche d'un lead et cliquez sur le bouton "Générer" dans la section Ice Breaker AI.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Coût: ~0,01 centime par génération avec GPT-4o-mini</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
