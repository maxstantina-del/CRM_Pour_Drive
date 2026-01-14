import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Building2, DollarSign, Edit, Trash2, Linkedin, QrCode } from 'lucide-react';
import { Lead } from '../../lib/types';
import { QRCodeCanvas } from 'qrcode.react';
import { ensureUrlProtocol } from '../../lib/utils';
import { useGlobalTimer, calculateCountdown } from '../../hooks/useGlobalTimer';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onViewDetails: (lead: Lead) => void;
  isDragging?: boolean;
}

function ActionCountdown({ date, time }: { date: string; time?: string }) {
  // Utilise le timer global au lieu d'un setInterval par composant
  // Beaucoup plus performant avec 100+ leads
  useGlobalTimer();

  // Calcule le countdown en temps réel (se met à jour via useGlobalTimer)
  const { label, status } = calculateCountdown(date, time);

  let colors = 'bg-blue-500/20 text-blue-300';
  if (status === 'late') colors = 'bg-red-500/20 text-red-300';
  if (status === 'today') colors = 'bg-amber-500/20 text-amber-300';

  return (
    <div className={`flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap ${colors}`}>
      {label}
    </div>
  );
}

export function LeadCard({ lead, onEdit, onDelete, onViewDetails, isDragging }: LeadCardProps) {
  const [showQR, setShowQR] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowQR(false);
      }
    };

    if (showQR) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQR]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: 1.02 }}
      onClick={() => onViewDetails(lead)}
      className={`
        glass rounded-lg p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4 cursor-pointer group transition-all duration-200 relative
        ${isDragging ? 'opacity-50 rotate-3' : 'hover:shadow-lg'}
      `}
    >
      <div className="flex items-start justify-between mb-1 sm:mb-1.5 md:mb-2 lg:mb-3">
        <h3 className="font-semibold text-gray-100 text-xs sm:text-sm md:text-base lg:text-lg truncate pr-1" title={lead.name}>{lead.name}</h3>
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 rounded-xl p-1.5 backdrop-blur-md z-20 shadow-xl border border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQR(!showQR);
            }}
            className={`p-2.5 rounded-lg hover:bg-white/10 transition-colors ${showQR ? 'text-accent-blue' : 'text-gray-300'}`}
            title="Afficher QR Phone"
            aria-label="Afficher QR Phone"
          >
            <QrCode size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lead);
            }}
            className="p-2.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-accent-blue transition-colors"
            title="Modifier le lead"
            aria-label="Modifier le lead"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead.id);
            }}
            className="p-2.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-accent-red transition-colors"
            title="Supprimer le lead"
            aria-label="Supprimer le lead"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {showQR && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowQR(false);
          }}
          className="absolute inset-0 z-30 bg-gray-900/95 flex flex-col items-center justify-center rounded-lg backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200 cursor-pointer"
        >
          <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center cursor-default">
            <h4 className="text-sm font-semibold mb-3 text-white">QR Phone</h4>
            <div className="bg-white p-2 rounded-lg">
              <QRCodeCanvas
                value={`tel:${lead.phone}`}
                size={120}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Scanner pour appeler directement</p>
          </div>
        </div>
      )}

      <div className="space-y-0.5 sm:space-y-1 mb-1 sm:mb-1.5 md:mb-2 lg:mb-3">
        {(lead.contactName || lead.jobTitle) && (
          <div className="mb-0.5 sm:mb-1 md:mb-2">
            {lead.contactName && (
              <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-200 truncate">{lead.contactName}</div>
            )}
            {lead.jobTitle && (
              <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 truncate">{lead.jobTitle}</div>
            )}
          </div>
        )}
        {lead.company && (
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-400">
            <Building2 size={10} className="sm:w-3 sm:h-3 md:w-[14px] md:h-[14px] flex-shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-400">
            <Phone size={10} className="sm:w-3 sm:h-3 md:w-[14px] md:h-[14px] flex-shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-400">
            <Mail size={10} className="sm:w-3 sm:h-3 md:w-[14px] md:h-[14px] flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
      </div>



      <div className="flex gap-3 mb-3">

        {lead.linkedin && (
          <a
            href={ensureUrlProtocol(lead.linkedin)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            aria-label="Voir le profil LinkedIn"
          >
            <Linkedin size={12} /> LinkedIn
          </a>
        )}
      </div>

      {lead.nextAction && (
        <div className="mt-3 pt-2 border-t border-white/5 bg-white/5 rounded px-2 py-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-300 flex items-center gap-2">
            {lead.nextAction === 'call' && '📞 Appeler'}
            {lead.nextAction === 'email' && '✉️ Email'}
            {lead.nextAction === 'meeting' && '🤝 RDV'}
            {lead.nextAction === 'proposal' && '📄 Proposition'}
            {lead.nextAction === 'followup' && '🔄 Relancer'}
          </span>
          <div className="flex-1 flex items-center justify-between gap-2 ml-4">
            {lead.nextActionDate && (
              <>
                <span className="text-[10px] text-gray-400">
                  {new Date(lead.nextActionDate).toLocaleDateString()}
                </span>
                {lead.nextActionTime && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    {lead.nextActionTime}
                  </span>
                )}
                <ActionCountdown date={lead.nextActionDate} time={lead.nextActionTime} />
              </>
            )}
          </div>
        </div>
      )}

      {lead.value > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
          <DollarSign size={16} className="text-accent-green" />
          <span className="font-semibold text-accent-green">{formatCurrency(lead.value)}</span>
        </div>
      )}
    </motion.div>
  );
}
