import SectionTitle from '../../components/atoms/SectionTitle';
import IconFolderUpload from '../../components/atoms/icons/FolderUpload';

export default function UploadPage() {
  return (
    <div className="space-y-4">
      <SectionTitle icon={<IconFolderUpload />}>Upload</SectionTitle>
      <div className="text-[12px] text-neutral-600">ここにフォルダアップロードUI（ドラッグ&ドロップや進捗表示）が入ります。</div>
    </div>
  );
} 