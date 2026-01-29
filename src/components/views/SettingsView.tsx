/**
 * Settings view
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../ui';
import { Settings as SettingsIcon, Info } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} />
            <CardTitle>Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Stockage des données</h3>
              <p className="text-sm text-gray-600">
                Les données sont stockées localement dans votre navigateur (localStorage).
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Synchronisation Supabase</h3>
              <p className="text-sm text-gray-600">
                {import.meta.env.VITE_SUPABASE_URL
                  ? '✓ Configuré - Les données sont synchronisées avec Supabase'
                  : '✗ Non configuré - Utilisant uniquement le stockage local'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info size={20} />
            <CardTitle>À propos</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm">
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Application:</strong> Simple CRM</p>
            <p className="text-gray-600 mt-4">
              CRM simple et puissant pour gérer vos leads efficacement.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
