import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const Component = hover ? motion.div : 'div';

  return (
    <Component
      {...(hover && {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      })}
      onClick={onClick}
      className={`
        glass rounded-xl p-4 transition-all duration-200
        ${hover ? 'cursor-pointer glass-hover' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
