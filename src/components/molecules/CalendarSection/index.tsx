'use client';

import React, { useMemo, useState } from 'react';
import SectionContainer from '../../atoms/SectionContainer';

interface CalendarSectionProps {
	className?: string;
}

export default function CalendarSection({ className = '' }: CalendarSectionProps): React.ReactElement {
	const [calendarDate, setCalendarDate] = useState<Date>(new Date());
	const [todayKey, setTodayKey] = useState<string>('');

	const WEEKDAYS: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	const startOfMonth = useMemo<Date>(() => new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1), [calendarDate]);
	const daysInMonth = useMemo<number>(() => new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate(), [calendarDate]);
	const leadingBlanks = useMemo<number>(() => startOfMonth.getDay(), [startOfMonth]);
	const daysArray = useMemo<number[]>(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

	// Set todayKey on client side only to prevent hydration mismatch
	React.useEffect(() => {
		const d = new Date();
		setTodayKey(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
	}, []);

	// Mock events (dot under the day)
	const eventDays = useMemo<Set<string>>(() => new Set<string>([
		`${calendarDate.getFullYear()}-${calendarDate.getMonth()}-3`,
		`${calendarDate.getFullYear()}-${calendarDate.getMonth()}-12`,
		`${calendarDate.getFullYear()}-${calendarDate.getMonth()}-24`,
	]), [calendarDate]);

	return (
		<SectionContainer
			className={`flex-1 flex flex-col ${className}`}
			title="calendar"
			titleAction={
				<div className="flex items-center gap-1">
					<button
						onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
						className="h-6 w-6 text-[11px] rounded hover:bg-neutral-50"
						aria-label="prev month"
					>
						‹
					</button>
					<div className="text-[11px] text-neutral-800">
						{calendarDate.toLocaleString('ja-JP', { year: 'numeric', month: 'short' })}
					</div>
					<button
						onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
						className="h-6 w-6 text-[11px] rounded hover:bg-neutral-50"
						aria-label="next month"
					>
						›
					</button>
				</div>
			}
		>
			<div className="flex-1 flex items-start justify-center p-2">
				<div className="grid grid-cols-7 gap-0.5 w-full max-w-[300px]">
					{WEEKDAYS.map((d: string, i: number) => (
						<div key={`wd-${i}-${d}`} className="text-center text-[10px] text-neutral-500 flex items-center justify-center aspect-square">{d}</div>
					))}
					{Array.from({ length: leadingBlanks }, (_, i) => (
						<div key={`blank-${i}`} className="aspect-square" />
					))}
					{daysArray.map((day: number) => {
						const key = `${calendarDate.getFullYear()}-${calendarDate.getMonth()}-${day}`;
						const isToday = key === todayKey;
						const hasEvent = eventDays.has(key);
						return (
							<button
								key={key}
								className={`aspect-square w-full rounded text-[11px] ${isToday ? 'bg-neutral-100 text-neutral-900' : 'hover:bg-neutral-50 text-neutral-700'}`}
							>
								<div className="flex h-full flex-col items-center justify-center">
									<span>{day}</span>
									{hasEvent && <span className="mt-0.5 h-1 w-1 rounded-full bg-neutral-700" />}
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</SectionContainer>
	);
}
