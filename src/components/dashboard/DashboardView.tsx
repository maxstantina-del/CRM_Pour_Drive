import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Euro, Zap, Trophy } from 'lucide-react';
import { Lead } from '../../lib/types';
import { StatCard } from './StatCard';
import { Card } from '../ui';

interface DashboardViewProps {
  leads: Lead[];
}

export function DashboardView({ leads }: DashboardViewProps) {
  const stats = useMemo(() => {
    const activeLeads = leads.filter((l) => !['won', 'lost'].includes(l.stage));
    const closedWon = leads.filter((l) => l.stage === 'won');
    const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    return {
      totalLeads: leads.length,
      activeLeads: activeLeads.length,
      closedWon: closedWon.length,
      totalValue,
      avgValue: leads.length > 0 ? totalValue / leads.length : 0,
      conversionRate: leads.length > 0 ? (closedWon.length / leads.length) * 100 : 0,
    };
  }, [leads]);

  const recentLeads = useMemo(() => leads.slice(0, 5), [leads]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 pb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Sun}
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title="Active Leads"
          value={stats.activeLeads}
          icon={Zap}
          color="from-amber-400 to-amber-600"
          delay={0.1}
        />
        <StatCard
          title="Closed Won"
          value={stats.closedWon}
          icon={Trophy}
          color="from-emerald-400 to-emerald-600"
          trend={{ value: Math.round(stats.conversionRate), isPositive: stats.conversionRate > 0 }}
          delay={0.2}
        />
        <StatCard
          title="Total Value"
          value={Math.round(stats.totalValue)}
          icon={Euro}
          prefix="€"
          color="from-indigo-400 to-indigo-600"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Pipeline Overview</h3>
          <div className="space-y-4">
            {[
              { stage: 'Prospect', count: leads.filter((l) => l.stage === 'prospect').length, color: 'bg-stage-prospect' },
              { stage: 'Qualified', count: leads.filter((l) => l.stage === 'qualified').length, color: 'bg-stage-qualified' },
              { stage: 'Proposal', count: leads.filter((l) => l.stage === 'proposal').length, color: 'bg-stage-proposal' },
              { stage: 'Negotiation', count: leads.filter((l) => l.stage === 'negotiation').length, color: 'bg-stage-negotiation' },
            ].map((item, index) => (
              <motion.div
                key={item.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-400 flex-1">{item.stage}</span>
                <span className="text-sm font-medium text-gray-200">{item.count}</span>
                <div className="w-32 bg-dark-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalLeads > 0 ? (item.count / stats.totalLeads) * 100 : 0}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.company || lead.email}</p>
                  </div>
                  {lead.value > 0 && (
                    <span className="text-sm font-medium text-accent-green">
                      {lead.value.toLocaleString()} €
                    </span>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No leads yet</p>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
