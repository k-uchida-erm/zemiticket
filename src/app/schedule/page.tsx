import SectionTitle from '../../components/atoms/SectionTitle';
import IconCalendar from '../../components/atoms/icons/Calendar';

export default function SchedulePage() {
  return (
    <div className="space-y-4">
      <SectionTitle icon={<IconCalendar />}>Schedule</SectionTitle>
      <div className="text-[12px] text-neutral-600">ここにスケジュール調整UI（カレンダーや投票）が入ります。</div>
    </div>
  );
} 