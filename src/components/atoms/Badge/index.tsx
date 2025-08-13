interface BadgeProps {
  label: string;
  className?: string;
  size?: 'xs' | 'sm';
  color?: 'neutral' | 'emerald' | 'indigo' | 'amber' | 'red' | 'blue';
}

export default function Badge({ label, className = '', size = 'xs', color = 'neutral' }: BadgeProps) {
  const sizeCls = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';
  const colorMap = {
    neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  } as const;
  return (
    <span className={`rounded-full border ${colorMap[color]} ${sizeCls} ${className}`}>
      {label}
    </span>
  );
} 