/**
 * Backwards-compat alias — all state now lives in TagsContext so every
 * component (TagsManager, LeadForm, TagPicker, TableView, PipelineView…)
 * sees the same up-to-date list.
 */

export { useTagsContext as useTags } from '../contexts/TagsContext';
export type { Tag } from '../services/tagsService';
