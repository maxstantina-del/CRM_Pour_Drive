import { useState, type FormEvent } from 'react';
import { Tag as TagIcon, Plus, X, Check } from 'lucide-react';
import { useTags } from '../../hooks/useTags';

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function TagPicker({ leadId }: { leadId: string }) {
  const { tags, getTagsForLead, createTag, toggleLeadTag } = useTags();
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
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
        >
          <TagIcon className="w-3 h-3" />
          {assigned.length === 0 ? 'Ajouter tag' : 'Gérer'}
        </button>
      </div>

      {open && (
        <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(t => {
                const active = assigned.some(a => a.id === t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleLeadTag(leadId, t)}
                    style={{
                      backgroundColor: active ? t.color + '33' : 'transparent',
                      color: t.color,
                      borderColor: t.color,
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border hover:bg-gray-50"
                  >
                    {active && <Check className="w-3 h-3" />}
                    {t.name}
                  </button>
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
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
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
