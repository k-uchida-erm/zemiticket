"use client";

interface SubHeaderItem {
	key: string;
	label: string;
}

export default function SubHeader({ items, activeKey, onChange }: { items: SubHeaderItem[]; activeKey: string; onChange: (k: string) => void }) {
	return (
		<div className="sticky top-0 z-30 bg-white relative -mt-0">
			<div className="absolute -top-6 left-0 right-0 h-6 bg-white" aria-hidden />
			<div className="flex gap-6 pt-0">
				{items.map((it) => (
					<button
						key={it.key}
						className={`text-[14px] pb-2 border-b-2 ${activeKey === it.key ? 'border-[#00b393] text-[#00b393]' : 'border-transparent text-neutral-600 hover:text-neutral-800'}`}
						onClick={() => onChange(it.key)}
					>
						{it.label}
					</button>
				))}
			</div>
		</div>
	);
} 