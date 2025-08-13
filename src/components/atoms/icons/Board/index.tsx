type Props = { className?: string; strokeWidth?: number };
export default function IconBoard({ className = 'w-5 h-5', strokeWidth = 1.8 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h6" />
    </svg>
  );
} 