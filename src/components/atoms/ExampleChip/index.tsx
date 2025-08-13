interface ExampleChipProps {
  text: string;
  onClick: (text: string) => void;
}

export default function ExampleChip({ text, onClick }: ExampleChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 hover:bg-neutral-200"
    >
      {text}
    </button>
  );
} 