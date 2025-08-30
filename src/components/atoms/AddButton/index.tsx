import IconPlus from '../icons/Plus';

interface AddButtonProps {
	onClick: () => void;
}

export default function AddButton({ onClick }: AddButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[#00b393] hover:bg-[#00b393]/10 border border-[#00b393]"
		>
			<IconPlus className="w-3 h-3" />
		</button>
	);
} 