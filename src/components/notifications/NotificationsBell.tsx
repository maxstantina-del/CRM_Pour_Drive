/**
 * Bell icon in the header with unread badge + popover list of recent notifs.
 * Triggers a toast whenever a new notification arrives via Realtime.
 */

import React, { useCallback, useState } from 'react';
import { Bell, Trophy, Check, Calendar } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../contexts/ToastContext';
import type { Notification } from '../../services/notificationsService';

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diffSec < 60) return 'à l\'instant';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffDay = Math.floor(diffH / 24);
  if (diffDay < 7) return `il y a ${diffDay} j`;
  return d.toLocaleDateString('fr-FR');
}

function prettyFirstSlot(availability: string | undefined): string {
  if (!availability) return '';
  const first = availability.split(';;')[0]?.trim();
  if (!first) return '';
  const m = first.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?/);
  if (!m) return first;
  const [, y, mo, d, time] = m;
  const dt = new Date(`${y}-${mo}-${d}T${time || '00:00'}`);
  const day = dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  return time ? `${day} à ${time.replace(':', 'h')}` : day;
}

function renderNotif(n: Notification): { icon: React.ReactNode; title: string; subtitle: string } {
  if (n.kind === 'lead_won') {
    const leadName = String(n.payload.leadName ?? 'Un lead');
    const pipelineName = String(n.payload.pipelineName ?? '');
    return {
      icon: <Trophy className="text-yellow-500" size={18} />,
      title: `🏆 ${leadName} gagné`,
      subtitle: pipelineName ? `Pipeline « ${pipelineName} »` : '',
    };
  }
  if (n.kind === 'fiche_appointment') {
    const leadName = String(n.payload.leadCompany ?? n.payload.leadName ?? 'Un lead');
    const actorEmail = String(n.payload.actorEmail ?? 'Un collègue');
    const isUpdate = n.payload.isUpdate === true;
    const availability = typeof n.payload.availability === 'string' ? n.payload.availability : '';
    const slotsCount = availability.split(';;').map((s) => s.trim()).filter(Boolean).length;
    const firstPretty = prettyFirstSlot(availability);
    const plate = typeof n.payload.vehiclePlate === 'string' ? n.payload.vehiclePlate : '';
    return {
      icon: <Calendar className="text-blue-500" size={18} />,
      title: isUpdate
        ? `📅 RDV modifié — ${leadName}`
        : `📅 ${slotsCount > 1 ? `${slotsCount} RDV planifiés` : 'Nouveau RDV'} — ${leadName}`,
      subtitle: [firstPretty, plate ? `(${plate})` : '', `par ${actorEmail}`]
        .filter(Boolean)
        .join(' · '),
    };
  }
  return {
    icon: <Bell size={18} className="text-gray-500" />,
    title: String(n.payload.title ?? n.kind),
    subtitle: '',
  };
}

export interface NotificationsBellProps {
  onOpenLead?: (leadId: string) => void;
}

export function NotificationsBell({ onOpenLead }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  const handleArrival = useCallback(
    (notif: Notification) => {
      if (notif.kind === 'lead_won') {
        const leadName = String(notif.payload.leadName ?? 'Un lead');
        showToast(`🏆 ${leadName} est gagné !`, 'success');
      } else if (notif.kind === 'fiche_appointment') {
        const leadName = String(notif.payload.leadCompany ?? notif.payload.leadName ?? 'Un lead');
        const isUpdate = notif.payload.isUpdate === true;
        showToast(
          isUpdate
            ? `📅 RDV modifié sur ${leadName}`
            : `📅 Nouveau RDV planifié sur ${leadName}`,
          'success'
        );
      }
    },
    [showToast]
  );

  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications(handleArrival);

  const handleClickNotif = async (n: Notification) => {
    if (!n.readAt) await markAsRead(n.id);
    const leadId = typeof n.payload.leadId === 'string' ? n.payload.leadId : null;
    if (leadId && onOpenLead) onOpenLead(leadId);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-40 w-[360px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <Check size={12} /> Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-8">
                  Aucune notification pour le moment.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.map((n) => {
                    const { icon, title, subtitle } = renderNotif(n);
                    const unread = !n.readAt;
                    return (
                      <li
                        key={n.id}
                        className={`cursor-pointer transition-colors ${
                          unread
                            ? 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                        onClick={() => handleClickNotif(n)}
                      >
                        <div className="flex items-start gap-3 px-4 py-3">
                          <div className="shrink-0 mt-0.5">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {title}
                            </p>
                            {subtitle && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                                {subtitle}
                              </p>
                            )}
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                              {relativeTime(n.createdAt)}
                            </p>
                          </div>
                          {unread && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
