import { useState, type FormEvent } from 'react';
import { Tag as TagIcon, Plus, X, Check, Trash2 } from 'lucide-react';
import { useTags } from '../../hooks/useTags';

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function TagPicker({ leadId }: { leadId: string }) {
  const { tags, getTagsForLead, createTag, toggleLeadTag, deleteTag } = useTags();

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Supprimer définitivement le tag "${tagName}" ? Il sera retiré de tous les leads qui l'utilisent.`)) return;
    try { await deleteTag(tagId); } catch (err) { console.error(err); }
  };
  const assigned = getTagsForLead(leadId);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;
    const created = await createTag(name, newTagColor);
    await toggleLeadTag(leadId, created);
    setNewTagName('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {assigned.map(t => (
          <span
            key={t.id}
            style={{ backgroundColor: t.color + '22', color: t.color, borderColor: t.color }}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border"
          >
            {t.name}
            <button
              onClick={() => toggleLeadTag(leadId, t)}
              className="hover:opacity-70"
              title="Retirer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full"
        >
          <TagIcon className="w-3 h-3" />
          {assigned.length === 0 ? 'Ajouter tag' : 'Gérer'}
        </button>
      </div>

      {open && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-900">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(t => {
                const active = assigned.some(a => a.id === t.id);
                return (
                  <span
                    key={t.id}
                    className="group/tag inline-flex items-center rounded-full border"
                    style={{
                      backgroundColor: active ? t.color + '33' : 'transparent',
                      borderColor: t.color,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLeadTag(leadId, t)}
                      style={{ color: t.color }}
                      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs font-medium"
                      title={active ? 'Retirer de ce lead' : 'Ajouter à ce lead'}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {t.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(t.id, t.name)}
                      style={{ color: t.color }}
                      className="p-0.5 mr-0.5 rounded-full opacity-40 group-hover/tag:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 hover:!text-red-600 dark:hover:!text-red-400 transition-all"
                      title="Supprimer définitivement ce tag"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <form onSubmit={submit} className="flex gap-1 items-center">
            <input
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Nouveau tag…"
              className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <div className="flex gap-0.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTagColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full border-2 ${newTagColor === c ? 'border-gray-900' : 'border-transparent'}`}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={!newTagName.trim()}
              className="px-2 py-1 bg-indigo-600 disabled:opacity-50 text-white rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
