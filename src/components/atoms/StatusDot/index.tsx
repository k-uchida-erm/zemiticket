import type { ButtonHTMLAttributes } from 'react';

interface StatusDotProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  completed: boolean;
  variant?: 'subticket' | 'todo';
}

export default function StatusDot({ completed, variant = 'subticket', className = '', ...rest }: StatusDotProps) {
  // Slightly larger for better visibility/tap target
  const sizeClass = 'w-4 h-4';
  const base = `inline-flex items-center justify-center rounded-full shrink-0 ${sizeClass}`;
  const style = completed ? 'bg-[#00b393] text-white' : 'border border-neutral-400';
  return (
    <button
      type="button"
      className={`${base} ${style} ${className}`}
      aria-label={completed ? 'completed' : 'incomplete'}
      {...rest}
    >
      {completed && (
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5.5 12.5l4.4 4.4 8.8-8.8" />
        </svg>
      )}
    </button>
  );
} 