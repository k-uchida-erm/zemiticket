type Props = { className?: string; strokeWidth?: number };
export default function IconUser({ className = 'w-5 h-5', strokeWidth = 1.8 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="7" r="3.2" />
      <path d="M4.5 20c1.7-3.5 5.3-5 7.5-5s5.8 1.5 7.5 5" />
    </svg>
  );
} 