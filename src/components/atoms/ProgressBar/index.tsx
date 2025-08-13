interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export default function ProgressBar({ percentage, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`} aria-label="progress">
      <div
        className="h-full bg-[#00b393] transition-all"
        style={{ width: `${clamped}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      />
    </div>
  );
} 