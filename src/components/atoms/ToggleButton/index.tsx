import IconSidebar from '../icons/Sidebar';

interface ToggleButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
  title?: string;
}

export default function ToggleButton({ 
  isCollapsed, 
  onToggle, 
  className = '',
  title
}: ToggleButtonProps) {
  const defaultTitle = isCollapsed ? "展開" : "収納";
  
  return (
    <button
      onClick={onToggle}
      className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors ${className}`}
      title={title || defaultTitle}
    >
      <IconSidebar className={`w-4 h-4 text-neutral-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
    </button>
  );
} 