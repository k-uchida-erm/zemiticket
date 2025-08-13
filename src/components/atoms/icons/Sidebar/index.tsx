import type { SVGProps } from 'react';

export default function IconSidebar(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props} className={`${props.className || ''} w-5 h-5`}>
			<path d="M9 6l6 6-6 6" />
		</svg>
	);
} 