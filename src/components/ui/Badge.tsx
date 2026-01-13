import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: string;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ children, variant = 'default', icon, className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    // Legacy stage mappings
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    contact: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    meeting: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    proposal: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    negotiation: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    won: 'bg-green-500/20 text-green-300 border-green-500/30',
    lost: 'bg-red-500/20 text-red-300 border-red-500/30',

    // Generic colors
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    teal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border backdrop-blur-sm transition-all duration-200
        ${variants[variant]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
