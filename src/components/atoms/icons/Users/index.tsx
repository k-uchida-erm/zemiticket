import type { SVGProps } from 'react';

export default function IconUsers(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props} className={`${props.className || ''} w-5 h-5`}>
			<circle cx="9" cy="8" r="3" />
			<circle cx="15" cy="8" r="3" />
			<path d="M4.5 18c0-2.761 2.686-5 6-5s6 2.239 6 5" />
			<path d="M2.5 18.5c.4-2 2-3.5 4-4.2" />
			<path d="M21.5 18.5c-.4-2-2-3.5-4-4.2" />
		</svg>
	);
} 