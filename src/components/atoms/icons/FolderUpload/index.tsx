type Props = { className?: string; strokeWidth?: number };
export default function IconFolderUpload({ className = 'w-5 h-5', strokeWidth = 1.8 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M12 16V9M9.5 11.5L12 9l2.5 2.5" />
    </svg>
  );
} 