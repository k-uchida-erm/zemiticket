import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-neutral-200/70 rounded-none ${className}`}>
      {children}
    </div>
  );
} 