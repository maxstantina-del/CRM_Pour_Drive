/**
 * Curated Lucide icons available for pipeline stages.
 * ~120 icons grouped by category for picker UX.
 */

import {
  // Contact & Communication
  Phone, PhoneCall, PhoneOutgoing, PhoneIncoming, Mail, MailOpen, MessageSquare,
  MessageCircle, Send, AtSign, Voicemail, Mic,
  // Status & Progression
  Target, CheckCircle, CheckCircle2, Check, XCircle, X, AlertCircle, AlertTriangle,
  Clock, Hourglass, Loader, RefreshCw, Play, Pause, StopCircle, Rocket,
  // Money & Commerce
  DollarSign, Euro, CreditCard, Wallet, Banknote, Receipt, ShoppingCart, ShoppingBag,
  Tag, Tags, Package, Truck, Handshake, TrendingUp,
  // People & Business
  Users, User, UserCheck, UserPlus, UserX, Building, Building2, Briefcase, Factory,
  Store, Home, Landmark, Contact, BadgeCheck,
  // Calendar & Time
  Calendar, CalendarCheck, CalendarClock, CalendarX, Timer, Clock3, CalendarDays,
  CalendarHeart, CalendarMinus, CalendarPlus,
  // Documents
  FileText, FileCheck, FileX, FileSignature, Files, FolderOpen, File, Paperclip,
  Pen, Edit, Clipboard, ClipboardCheck,
  // Flags & Priority
  Star, StarOff, Heart, Flag, FlagTriangleRight, Bookmark, ThumbsUp, ThumbsDown,
  Zap, Flame, Sparkles, Award,
  // Actions & Navigation
  ArrowRight, ArrowUpRight, ArrowDown, ArrowUp, ChevronsRight, MoveRight,
  Search, Filter, Eye, EyeOff, Lock, Unlock, Shield, Key,
  // Business flow
  Trophy, Medal, Crown, GitBranch, GitMerge, Workflow, Network, Share2,
  Link, Bell, BellRing, Lightbulb,
  // Fallback
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export const STAGE_ICON_MAP: Record<string, LucideIcon> = {
  Phone, PhoneCall, PhoneOutgoing, PhoneIncoming, Mail, MailOpen, MessageSquare,
  MessageCircle, Send, AtSign, Voicemail, Mic,
  Target, CheckCircle, CheckCircle2, Check, XCircle, X, AlertCircle, AlertTriangle,
  Clock, Hourglass, Loader, RefreshCw, Play, Pause, StopCircle, Rocket,
  DollarSign, Euro, CreditCard, Wallet, Banknote, Receipt, ShoppingCart, ShoppingBag,
  Tag, Tags, Package, Truck, Handshake, TrendingUp,
  Users, User, UserCheck, UserPlus, UserX, Building, Building2, Briefcase, Factory,
  Store, Home, Landmark, Contact, BadgeCheck,
  Calendar, CalendarCheck, CalendarClock, CalendarX, Timer, Clock3, CalendarDays,
  CalendarHeart, CalendarMinus, CalendarPlus,
  FileText, FileCheck, FileX, FileSignature, Files, FolderOpen, File, Paperclip,
  Pen, Edit, Clipboard, ClipboardCheck,
  Star, StarOff, Heart, Flag, FlagTriangleRight, Bookmark, ThumbsUp, ThumbsDown,
  Zap, Flame, Sparkles, Award,
  ArrowRight, ArrowUpRight, ArrowDown, ArrowUp, ChevronsRight, MoveRight,
  Search, Filter, Eye, EyeOff, Lock, Unlock, Shield, Key,
  Trophy, Medal, Crown, GitBranch, GitMerge, Workflow, Network, Share2,
  Link, Bell, BellRing, Lightbulb,
  HelpCircle,
};

export interface IconCategory {
  id: string;
  label: string;
  icons: string[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    id: 'contact',
    label: 'Contact',
    icons: ['Phone', 'PhoneCall', 'PhoneOutgoing', 'PhoneIncoming', 'Mail', 'MailOpen',
      'MessageSquare', 'MessageCircle', 'Send', 'AtSign', 'Voicemail', 'Mic'],
  },
  {
    id: 'status',
    label: 'Statut',
    icons: ['Target', 'CheckCircle', 'CheckCircle2', 'Check', 'XCircle', 'X',
      'AlertCircle', 'AlertTriangle', 'Clock', 'Hourglass', 'Loader', 'RefreshCw',
      'Play', 'Pause', 'StopCircle', 'Rocket'],
  },
  {
    id: 'money',
    label: 'Commerce',
    icons: ['DollarSign', 'Euro', 'CreditCard', 'Wallet', 'Banknote', 'Receipt',
      'ShoppingCart', 'ShoppingBag', 'Tag', 'Tags', 'Package', 'Truck',
      'Handshake', 'TrendingUp'],
  },
  {
    id: 'people',
    label: 'Personnes',
    icons: ['Users', 'User', 'UserCheck', 'UserPlus', 'UserX', 'Building', 'Building2',
      'Briefcase', 'Factory', 'Store', 'Home', 'Landmark', 'Contact', 'BadgeCheck'],
  },
  {
    id: 'calendar',
    label: 'Calendrier',
    icons: ['Calendar', 'CalendarCheck', 'CalendarClock', 'CalendarX', 'Timer',
      'Clock3', 'CalendarDays', 'CalendarHeart', 'CalendarMinus', 'CalendarPlus'],
  },
  {
    id: 'docs',
    label: 'Documents',
    icons: ['FileText', 'FileCheck', 'FileX', 'FileSignature', 'Files', 'FolderOpen',
      'File', 'Paperclip', 'Pen', 'Edit', 'Clipboard', 'ClipboardCheck'],
  },
  {
    id: 'flags',
    label: 'Priorité',
    icons: ['Star', 'StarOff', 'Heart', 'Flag', 'FlagTriangleRight', 'Bookmark',
      'ThumbsUp', 'ThumbsDown', 'Zap', 'Flame', 'Sparkles', 'Award'],
  },
  {
    id: 'actions',
    label: 'Actions',
    icons: ['ArrowRight', 'ArrowUpRight', 'ArrowDown', 'ArrowUp', 'ChevronsRight',
      'MoveRight', 'Search', 'Filter', 'Eye', 'EyeOff', 'Lock', 'Unlock',
      'Shield', 'Key'],
  },
  {
    id: 'flow',
    label: 'Business',
    icons: ['Trophy', 'Medal', 'Crown', 'GitBranch', 'GitMerge', 'Workflow',
      'Network', 'Share2', 'Link', 'Bell', 'BellRing', 'Lightbulb'],
  },
];

export function getStageIcon(name: string | undefined): LucideIcon {
  if (!name) return Target;
  return STAGE_ICON_MAP[name] ?? Target;
}

export const STAGE_COLORS = [
  // Rouges
  { id: 'red-light', label: 'Rouge clair', hex: '#FCA5A5' },
  { id: 'red', label: 'Rouge', hex: '#DC2626' },
  { id: 'red-dark', label: 'Rouge foncé', hex: '#991B1B' },
  // Roses
  { id: 'rose', label: 'Rose', hex: '#F43F5E' },
  { id: 'pink', label: 'Rose vif', hex: '#DB2777' },
  { id: 'fuchsia', label: 'Fuchsia', hex: '#C026D3' },
  // Violets / pourpres
  { id: 'purple-light', label: 'Lavande', hex: '#C4B5FD' },
  { id: 'purple', label: 'Pourpre', hex: '#9333EA' },
  { id: 'violet', label: 'Violet', hex: '#7C3AED' },
  { id: 'indigo', label: 'Indigo', hex: '#4F46E5' },
  // Bleus
  { id: 'blue-light', label: 'Bleu clair', hex: '#60A5FA' },
  { id: 'blue', label: 'Bleu', hex: '#2563EB' },
  { id: 'blue-dark', label: 'Bleu marine', hex: '#1E3A8A' },
  { id: 'sky', label: 'Ciel', hex: '#0EA5E9' },
  { id: 'cyan', label: 'Cyan', hex: '#0891B2' },
  { id: 'teal', label: 'Teal', hex: '#0D9488' },
  // Verts
  { id: 'emerald', label: 'Émeraude', hex: '#059669' },
  { id: 'green-light', label: 'Vert clair', hex: '#86EFAC' },
  { id: 'green', label: 'Vert', hex: '#16A34A' },
  { id: 'green-dark', label: 'Vert foncé', hex: '#166534' },
  { id: 'lime', label: 'Citron vert', hex: '#84CC16' },
  // Jaunes / ambres
  { id: 'yellow-light', label: 'Jaune pâle', hex: '#FEF08A' },
  { id: 'yellow', label: 'Jaune', hex: '#EAB308' },
  { id: 'yellow-dark', label: 'Jaune moutarde', hex: '#A16207' },
  { id: 'gold', label: 'Or', hex: '#D4A017' },
  { id: 'amber', label: 'Ambre', hex: '#D97706' },
  { id: 'amber-dark', label: 'Ambre foncé', hex: '#92400E' },
  // Oranges
  { id: 'orange-light', label: 'Pêche', hex: '#FDBA74' },
  { id: 'orange', label: 'Orange', hex: '#EA580C' },
  { id: 'orange-dark', label: 'Rouille', hex: '#9A3412' },
  // Terres / bruns
  { id: 'brown', label: 'Marron', hex: '#78350F' },
  { id: 'stone', label: 'Pierre', hex: '#78716C' },
  // Neutres
  { id: 'slate', label: 'Ardoise', hex: '#475569' },
  { id: 'slate-dark', label: 'Ardoise foncée', hex: '#1E293B' },
  { id: 'gray', label: 'Gris', hex: '#4B5563' },
  { id: 'gray-light', label: 'Gris clair', hex: '#9CA3AF' },
  { id: 'gray-dark', label: 'Gris foncé', hex: '#1F2937' },
  { id: 'zinc', label: 'Zinc', hex: '#52525B' },
  { id: 'neutral', label: 'Neutre', hex: '#525252' },
  // Accents spéciaux
  { id: 'mint', label: 'Menthe', hex: '#10B981' },
  { id: 'turquoise', label: 'Turquoise', hex: '#14B8A6' },
  { id: 'coral', label: 'Corail', hex: '#FB7185' },
  { id: 'plum', label: 'Prune', hex: '#6B21A8' },
  { id: 'navy', label: 'Marine', hex: '#0C4A6E' },
  { id: 'forest', label: 'Forêt', hex: '#064E3B' },
  { id: 'chocolate', label: 'Chocolat', hex: '#451A03' },
  { id: 'black', label: 'Noir', hex: '#111827' },
] as const;

export type StageColorId = typeof STAGE_COLORS[number]['id'];

export function getStageColorHex(id: string): string {
  return STAGE_COLORS.find((c) => c.id === id)?.hex ?? '#2563EB';
}
