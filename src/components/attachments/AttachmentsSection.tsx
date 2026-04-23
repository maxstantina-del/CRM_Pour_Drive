import { useRef, useState } from 'react';
import { Paperclip, Upload, Download, Trash2, FileText, Image as ImageIcon, File as FileIcon, Loader2, Eye } from 'lucide-react';
import { useAttachments } from '../../hooks/useAttachments';
import { getAttachmentSignedUrl, getAttachmentPreviewUrl, type Attachment } from '../../services/attachmentsService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
]);

function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1)} Mo`;
}

function iconFor(mime: string) {
  if (mime.startsWith('image/')) return <ImageIcon size={14} className="text-blue-500" />;
  if (mime === 'application/pdf') return <FileText size={14} className="text-red-500" />;
  if (mime.includes('word')) return <FileText size={14} className="text-blue-700" />;
  if (mime.includes('sheet') || mime.includes('excel')) return <FileText size={14} className="text-emerald-600" />;
  return <FileIcon size={14} className="text-gray-500" />;
}

async function downloadAttachment(a: Attachment) {
  const url = await getAttachmentSignedUrl(a);
  const link = document.createElement('a');
  link.href = url;
  link.download = a.filename;
  link.rel = 'noopener noreferrer';
  link.click();
}

export interface AttachmentsSectionProps {
  leadId: string;
}

export function AttachmentsSection({ leadId }: AttachmentsSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { attachments, loading, upload, remove } = useAttachments(leadId);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewFor, setPreviewFor] = useState<Attachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const file of list) {
      if (file.size > MAX_BYTES) {
        showToast(`${file.name} dépasse 10 Mo — upload refusé.`, 'error');
        continue;
      }
      if (!ALLOWED_MIME.has(file.type)) {
        showToast(`Type de fichier non autorisé : ${file.type || 'inconnu'}`, 'error');
        continue;
      }
      setUploading(true);
      try {
        await upload(file);
        showToast(`${file.name} ajouté`, 'success');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`Erreur upload : ${msg}`, 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (a: Attachment) => {
    if (!confirm(`Supprimer « ${a.filename} » ?`)) return;
    try {
      await remove(a);
      showToast('Pièce jointe supprimée', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Erreur : ${msg}`, 'error');
    }
  };

  const openPreview = async (a: Attachment) => {
    try {
      const url = await getAttachmentPreviewUrl(a);
      setPreviewFor(a);
      setPreviewUrl(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Erreur aperçu : ${msg}`, 'error');
    }
  };

  const closePreview = () => {
    setPreviewFor(null);
    setPreviewUrl(null);
  };

  const canPreview = (a: Attachment) => a.mimeType === 'application/pdf' || a.mimeType.startsWith('image/');

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Paperclip size={14} className="text-blue-600 dark:text-blue-400" />
          Pièces jointes
          {attachments.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {attachments.length}
            </span>
          )}
        </h4>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Joindre un fichier
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={Array.from(ALLOWED_MIME).join(',')}
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) void handleFiles(e.dataTransfer.files);
        }}
        className={`mb-2 rounded-lg border-2 border-dashed transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-800'
        } p-3 text-center text-xs text-gray-500 dark:text-gray-400`}
      >
        Glisse un fichier ici (PDF, images, Word, Excel, CSV) — max 10 Mo
      </div>

      {loading && attachments.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">Chargement…</p>
      )}

      {!loading && attachments.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Aucune pièce jointe pour le moment.</p>
      )}

      <ul className="space-y-1">
        {attachments.map((a) => (
          <li
            key={a.id}
            className="group flex items-center gap-2 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-900"
          >
            <span className="flex-shrink-0">{iconFor(a.mimeType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{a.filename}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {formatBytes(a.sizeBytes)} · {new Date(a.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {canPreview(a) && (
                <button
                  type="button"
                  onClick={() => openPreview(a)}
                  title="Aperçu"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <Eye size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => downloadAttachment(a)}
                title="Télécharger"
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Download size={13} />
              </button>
              {user?.id === a.ownerId && (
                <button
                  type="button"
                  onClick={() => handleDelete(a)}
                  title="Supprimer"
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {previewFor && previewUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {previewFor.filename}
              </h3>
              <button
                type="button"
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-2"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950">
              {previewFor.mimeType.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt={previewFor.filename}
                  className="max-w-full max-h-[80vh] mx-auto"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title={previewFor.filename}
                  className="w-full h-[80vh]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
