/**
 * Dashboard — KPI cards + funnel + monthly won value + stage conversion rates.
 */

import React, { useMemo } from 'react';
import type { Lead, StageConfig } from '../../lib/types';
import { Card, CardHeader, CardTitle, CardBody } from '../ui';
import { Users, TrendingUp, Trophy, XCircle, DollarSign, Percent } from 'lucide-react';
import { calculateStats, formatCurrency, formatPercentage } from '../../lib/utils';
import {
  buildFunnelData,
  buildMonthlyWonValue,
  buildStageConversion,
} from '../../lib/dashboardMetrics';
import { FunnelChart, MonthlyValueChart, StageConversionChart } from './charts';

export interface DashboardViewProps {
  leads: Lead[];
  stages: StageConfig[];
}

export function DashboardView({ leads, stages }: DashboardViewProps) {
  const stats = calculateStats(leads);

  const funnel = useMemo(() => buildFunnelData(leads, stages), [leads, stages]);
  const monthly = useMemo(() => buildMonthlyWonValue(leads, 12), [leads]);
  const conversion = useMemo(() => buildStageConversion(leads, stages), [leads, stages]);

  const statCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: <Users className="text-blue-500" size={24} /> },
    { title: 'Leads Actifs', value: stats.activeLeads, icon: <TrendingUp className="text-purple-500" size={24} /> },
    { title: 'Leads Gagnés', value: stats.wonLeads, icon: <Trophy className="text-green-500" size={24} /> },
    { title: 'Leads Perdus', value: stats.lostLeads, icon: <XCircle className="text-red-500" size={24} /> },
    { title: 'Valeur Gagnée', value: formatCurrency(stats.wonValue), icon: <DollarSign className="text-emerald-500" size={24} /> },
    { title: 'Taux de Conversion', value: formatPercentage(Math.round(stats.conversionRate)), icon: <Percent className="text-indigo-500" size={24} /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Vue d'ensemble de votre pipeline de vente</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} variant="elevated" padding="md" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Funnel + Stage Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Funnel du pipeline</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">% = taux de passage vs étape précédente</p>
          </CardHeader>
          <CardBody>
            <FunnelChart data={funnel} />
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Conversion entre étapes</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rouge &lt; 20% · Orange 20-40% · Vert &gt; 40%</p>
          </CardHeader>
          <CardBody>
            <StageConversionChart data={conversion} />
          </CardBody>
        </Card>
      </div>

      {/* Monthly Won Value */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Valeur gagnée (12 derniers mois)</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Basé sur la date de clôture ou dernière mise à jour</p>
        </CardHeader>
        <CardBody>
          <MonthlyValueChart data={monthly} />
        </CardBody>
      </Card>
    </div>
  );
}
