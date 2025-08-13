import SectionTitle from '../../components/atoms/SectionTitle';
import IconChat from '../../components/atoms/icons/Chat';

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <SectionTitle icon={<IconChat />}>Chat</SectionTitle>
      <div className="text-[12px] text-neutral-600">ここにチャットUI（スレッド・メッセージ入力）が入ります。</div>
    </div>
  );
} 