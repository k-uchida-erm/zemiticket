type Props = { className?: string; strokeWidth?: number };
export default function IconTicket({ className = 'w-5 h-5', strokeWidth = 1.8 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 7a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.414.586l4.5 4.5a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 12.5 19H6a2 2 0 0 1-2-2V7z" />
      <path d="M9 7v.01M9 11v.01M9 15v.01" />
    </svg>
  );
} 