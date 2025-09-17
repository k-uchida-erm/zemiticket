'use client';

import React, { useEffect, useRef, useState } from 'react';

type InlineEditableVariant = 'title' | 'body';

interface InlineEditableProps {
	value: string;
	placeholder?: string;
	onSave: (next: string) => Promise<void> | void;
	variant?: InlineEditableVariant;
	className?: string;
}

export default function InlineEditable({
	value,
	placeholder = '',
	onSave,
	variant = 'body',
	className = ''
}: InlineEditableProps): React.ReactElement {
	const [text, setText] = useState<string>(value);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setText(value);
	}, [value]);

	const handleInput = (): void => {
		setText(ref.current?.innerText ?? '');
	};

	const commit = async (): Promise<void> => {
		const next = (ref.current?.innerText ?? '').trimEnd();
		if (next !== value) {
			await onSave(next);
		}
	};

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>): Promise<void> => {
		if (variant === 'title' && (e.key === 'Enter' || e.key === 'Escape')) {
			e.preventDefault();
			await commit();
			(ref.current as HTMLDivElement)?.blur();
		}
	};

	const commonClass = variant === 'title'
		? 'text-base text-neutral-900'
		: 'text-sm leading-6 text-neutral-700';

	return (
		<div
			ref={ref}
			contentEditable
			suppressContentEditableWarning
			role="textbox"
			aria-label="inline editable"
			className={`${commonClass} outline-none focus:outline-none focus:ring-0 ${className}`}
			data-placeholder={placeholder}
			onInput={handleInput}
			onBlur={commit}
			onKeyDown={handleKeyDown}
		>
			{text || ''}
		</div>
	);
}


