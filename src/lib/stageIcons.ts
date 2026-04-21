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
  { id: 'blue', label: 'Bleu', hex: '#2563EB' },
  { id: 'indigo', label: 'Indigo', hex: '#4F46E5' },
  { id: 'violet', label: 'Violet', hex: '#7C3AED' },
  { id: 'purple', label: 'Pourpre', hex: '#9333EA' },
  { id: 'pink', label: 'Rose', hex: '#DB2777' },
  { id: 'red', label: 'Rouge', hex: '#DC2626' },
  { id: 'orange', label: 'Orange', hex: '#EA580C' },
  { id: 'amber', label: 'Ambre', hex: '#D97706' },
  { id: 'yellow', label: 'Jaune', hex: '#CA8A04' },
  { id: 'green', label: 'Vert', hex: '#16A34A' },
  { id: 'emerald', label: 'Émeraude', hex: '#059669' },
  { id: 'teal', label: 'Teal', hex: '#0D9488' },
  { id: 'cyan', label: 'Cyan', hex: '#0891B2' },
  { id: 'slate', label: 'Ardoise', hex: '#475569' },
  { id: 'gray', label: 'Gris', hex: '#4B5563' },
] as const;

export type StageColorId = typeof STAGE_COLORS[number]['id'];

export function getStageColorHex(id: string): string {
  return STAGE_COLORS.find((c) => c.id === id)?.hex ?? '#2563EB';
}
