/**
 * Global tag management: list, usage count, delete with confirm.
 */

import React from 'react';
import { Trash2, Tag as TagIcon } from 'lucide-react';
import { useTags } from '../../hooks/useTags';

export function TagsManager() {
  const { tags, leadTags, deleteTag } = useTags();

  // Count how many leads are using each tag
  const usageByTag = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const list of leadTags.values()) {
      for (const t of list) {
        counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [leadTags]);

  const handleDelete = async (tagId: string, tagName: string, count: number) => {
    const message = count > 0
      ? `Supprimer le tag "${tagName}" ? Il sera retiré de ${count} lead${count > 1 ? 's' : ''}.`
      : `Supprimer le tag "${tagName}" ?`;
    if (!confirm(message)) return;
    try {
      await deleteTag(tagId);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression du tag.');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tags</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {tags.length} tag{tags.length > 1 ? 's' : ''} · Création depuis une fiche lead.
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 italic p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <TagIcon size={16} />
          Aucun tag pour le moment.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg">
          {tags.map((t) => {
            const count = usageByTag.get(t.id) ?? 0;
            return (
              <li key={t.id} className="flex items-center gap-3 p-3">
                <span
                  className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 shadow shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {count === 0 ? 'Non utilisé' : `Utilisé sur ${count} lead${count > 1 ? 's' : ''}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(t.id, t.name, count)}
                  className="p-2 rounded text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
