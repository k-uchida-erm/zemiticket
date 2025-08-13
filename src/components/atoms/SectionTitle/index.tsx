interface SectionTitleProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'emerald' | 'amber' | 'indigo';
}

export default function SectionTitle({ icon, children, className = '' }: SectionTitleProps) {
  return (
    <div className={`mb-3 ${className}`}>
      <div className="grid grid-cols-[1.75rem_1fr] items-center gap-x-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#00b393]/5 border border-[#00b393]/20 text-[#00b393]">
          <span className="[&>*]:text-current [&_*]:text-current [&_svg]:text-current [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg]:w-5 [&_svg]:h-5">
            {icon}
          </span>
        </span>
        <h2 className="text-[16px] font-semibold tracking-tight text-neutral-500">
          <span className="inline bg-[linear-gradient(transparent_55%,_rgba(0,179,147,0.22)_55%,_rgba(0,179,147,0.22)_85%,_transparent_85%)] px-0.5">
            {children}
          </span>
        </h2>
      </div>
    </div>
  );
} 