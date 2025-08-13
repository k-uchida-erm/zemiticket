type Props = { className?: string; strokeWidth?: number };
export default function IconFlask({ className = 'w-5 h-5', strokeWidth = 1.8 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 2v5l-5.5 9.5A3 3 0 0 0 7 21h10a3 3 0 0 0 2.5-4.5L14 7V2" />
      <path d="M8 7h8" />
      <path d="M6.5 16h11" />
    </svg>
  );
} 