interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Avatar({ name, size = 32, className = '' }: AvatarProps) {
  const initial = name?.trim()?.[0] ?? '?';
  const dimension = `${size}px`;
  return (
    <div
      className={`rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium ${className}`}
      style={{ width: dimension, height: dimension, fontSize: size * 0.4 }}
      aria-label={`${name} avatar`}
    >
      {initial}
    </div>
  );
} 