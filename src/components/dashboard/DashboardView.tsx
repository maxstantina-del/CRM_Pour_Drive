/**
 * Dashboard view with statistics and metrics
 */

import React from 'react';
import type { Lead } from '../../lib/types';
import { Card, CardHeader, CardTitle, CardBody } from '../ui';
import {
  Users,
  TrendingUp,
  Trophy,
  XCircle,
  DollarSign,
  Percent
} from 'lucide-react';
import { calculateStats, formatCurrency, formatPercentage } from '../../lib/utils';

export interface DashboardViewProps {
  leads: Lead[];
}

export function DashboardView({ leads }: DashboardViewProps) {
  const stats = calculateStats(leads);

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: <Users className="text-blue-500" size={24} />,
      color: 'blue'
    },
    {
      title: 'Leads Actifs',
      value: stats.activeLeads,
      icon: <TrendingUp className="text-purple-500" size={24} />,
      color: 'purple'
    },
    {
      title: 'Leads Gagnés',
      value: stats.wonLeads,
      icon: <Trophy className="text-green-500" size={24} />,
      color: 'green'
    },
    {
      title: 'Leads Perdus',
      value: stats.lostLeads,
      icon: <XCircle className="text-red-500" size={24} />,
      color: 'red'
    },
    {
      title: 'Valeur Totale',
      value: formatCurrency(stats.totalValue),
      icon: <DollarSign className="text-yellow-500" size={24} />,
      color: 'yellow'
    },
    {
      title: 'Taux de Conversion',
      value: formatPercentage(Math.round(stats.conversionRate)),
      icon: <Percent className="text-indigo-500" size={24} />,
      color: 'indigo'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de votre pipeline de vente</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} variant="elevated" padding="md" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Leads by Stage */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Répartition par Étape</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {Object.entries(stats.leadsByStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {stage}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Value by Stage */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Valeur par Étape</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {Object.entries(stats.valueByStage)
              .filter(([_, value]) => value > 0)
              .sort(([_, a], [__, b]) => b - a)
              .map(([stage, value]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stage}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
