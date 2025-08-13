type Props = { className?: string; strokeWidth?: number };
export default function IconMaximize({ className = 'w-4 h-4', strokeWidth = 2 }: Props) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
			<polyline points="15 3 21 3 21 9" />
			<polyline points="9 21 3 21 3 15" />
			<polyline points="21 15 21 21 15 21" />
			<polyline points="3 9 3 3 9 3" />
		</svg>
	);
} 