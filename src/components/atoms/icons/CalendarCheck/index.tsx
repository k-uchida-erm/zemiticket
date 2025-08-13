type Props = { className?: string; strokeWidth?: number };
export default function IconCalendarCheck({ className = 'w-5 h-5', strokeWidth = 1.8 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3v4M16 3v4M3 9h18M5 11v10h14V11" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
} 