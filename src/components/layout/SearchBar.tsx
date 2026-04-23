import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Barre de recherche compacte (320px max) — inspirée Monday/Linear, discrète
 * tant qu'elle n'est pas utilisée, focus ring via shadow token.
 */
export function SearchBar({ value, onChange, placeholder = 'Rechercher…', className }: SearchBarProps) {
  return (
    <div className={cn('relative w-full max-w-[320px]', className)}>
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[color:var(--color-text-subtle)] pointer-events-none"
        aria-hidden
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-8 pl-8 pr-7 text-[13px] rounded-sm transition-colors',
          'bg-surface-2 border border-transparent text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)]',
          'hover:bg-[color:var(--color-border-subtle)]',
          'focus:outline-none focus:bg-surface focus:border-primary focus:shadow-focus'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text)] hover:bg-surface"
          title="Effacer"
          aria-label="Effacer la recherche"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
