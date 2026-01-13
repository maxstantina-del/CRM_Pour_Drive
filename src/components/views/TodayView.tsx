import { Lead } from '../../lib/types';
import { motion } from 'framer-motion';
import { Badge } from '../ui';
import { Edit, AlertCircle, Calendar } from 'lucide-react';

interface TodayViewProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

export function TodayView({ leads, onEdit }: TodayViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter active leads with actions
  const activeLeads = leads.filter(
    (lead) => lead.stage !== 'won' && lead.stage !== 'lost' && lead.nextActionDate
  );

  // Categorize leads
  const overdueLeads = activeLeads.filter((lead) => {
    const actionDate = new Date(lead.nextActionDate!);
    actionDate.setHours(0, 0, 0, 0);
    return actionDate < today;
  });

  const todayLeads = activeLeads.filter((lead) => {
    const actionDate = new Date(lead.nextActionDate!);
    actionDate.setHours(0, 0, 0, 0);
    return actionDate.getTime() === today.getTime();
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRelativeTime = (dateStr: string, timeStr?: string) => {
    const actionDate = new Date(dateStr);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      actionDate.setHours(parseInt(hours), parseInt(minutes));
    }

    const now = new Date();
    const diffMs = actionDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      // Overdue
      const absDiffMins = Math.abs(diffMins);
      const absDiffHours = Math.abs(diffHours);
      const absDiffDays = Math.abs(diffDays);

      if (absDiffDays > 0) return `En retard (${absDiffDays}j)`;
      if (absDiffHours > 0) return `En retard (${absDiffHours}h)`;
      return `En retard (${absDiffMins}min)`;
    }

    // Future
    if (diffDays > 0) return `Dans ${diffDays}j`;
    if (diffHours > 0) return `Dans ${diffHours}h`;
    if (diffMins > 0) return `Dans ${diffMins}min`;
    return 'Maintenant';
  };

  const LeadCard = ({ lead, isOverdue }: { lead: Lead; isOverdue: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-lg p-4 border-l-4 ${
        isOverdue ? 'border-red-500' : 'border-yellow-500'
      } hover:bg-white/5 transition-colors`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-200 mb-1">{lead.name}</h3>
          {lead.company && <p className="text-sm text-gray-400 mb-2">{lead.company}</p>}

          <div className="flex items-center gap-3 text-sm">
            <Badge variant={lead.stage}>{lead.stage}</Badge>
            <span className="text-accent-blue font-semibold">{formatCurrency(lead.value || 0)}</span>
          </div>

          {lead.nextAction && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-400">{lead.nextAction}</span>
              {lead.nextActionTime && (
                <span className="px-2 py-0.5 rounded bg-dark-700 text-gray-300 text-xs">
                  {lead.nextActionTime}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {getRelativeTime(lead.nextActionDate!, lead.nextActionTime)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => onEdit(lead)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
          title="Modifier"
        >
          <Edit size={16} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="px-8 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-gray-100">En Retard</h2>
            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
              {overdueLeads.length}
            </span>
          </div>

          <div className="space-y-3">
            {overdueLeads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-lg p-8 text-center"
              >
                <div className="text-4xl mb-3">✨</div>
                <p className="text-gray-400">Aucun lead en retard</p>
              </motion.div>
            ) : (
              overdueLeads.map((lead) => <LeadCard key={lead.id} lead={lead} isOverdue={true} />)
            )}
          </div>
        </div>

        {/* Today Column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-gray-100">Aujourd'hui</h2>
            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
              {todayLeads.length}
            </span>
          </div>

          <div className="space-y-3">
            {todayLeads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-lg p-8 text-center"
              >
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-gray-400">Aucun lead à traiter aujourd'hui</p>
              </motion.div>
            ) : (
              todayLeads.map((lead) => <LeadCard key={lead.id} lead={lead} isOverdue={false} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
