import type { SVGProps } from 'react';

export default function IconMoodGreat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="10" />
      {/* Eyes as short vertical lines */}
      <path d="M9 9.4v1.6" />
      <path d="M15 9.4v1.6" />
      {/* Bigger smile */}
      <path d="M7.5 15.2c1.6 1.7 3.2 2.5 4.5 2.5s2.9-.8 4.5-2.5" />
    </svg>
  );
} 