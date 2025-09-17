// 期限表示のユーティリティ関数

/**
 * 期限までの残り日数を計算し、適切な表示文字列を返す
 * @param dueDate 期限日（YYYY-MM-DD形式の文字列）
 * @param status チケットのステータス
 * @returns 表示用の文字列
 */
export function getDueDateDisplay(dueDate: string | null | undefined, status?: string): string {
  if (!dueDate) {
    return '期限なし';
  }

  // 完了済みの場合は何も表示しない
  if (status === 'done') {
    return '';
  }

  const today = new Date();
  const due = new Date(dueDate);

  // 日付を00:00:00に正規化
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // 期限切れ
    return '期限切れ';
  } else if (diffDays === 0) {
    return '今日期限';
  } else if (diffDays === 1) {
    return '明日期限';
  } else if (diffDays <= 13) {
    return `${diffDays}日後`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}週間後`;
  } else if (diffDays < 60) {
    return '1ヶ月後';
  } else if (diffDays < 90) {
    return '2ヶ月後';
  } else if (diffDays < 120) {
    return '3ヶ月後';
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months}ヶ月後`;
  }
}

/**
 * 期限の緊急度に基づいてCSSクラスを返す
 * @param dueDate 期限日（YYYY-MM-DD形式の文字列）
 * @param status チケットのステータス
 * @returns 色分け用のCSSクラス
 */
export function getDueDateColorClass(dueDate: string | null | undefined, status?: string): string {
  if (!dueDate) {
    return 'text-neutral-500';
  }

  // 完了済みの場合は色分けしない
  if (status === 'done') {
    return 'text-neutral-500';
  }

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // 期限切れ
    return 'text-red-600';
  } else if (diffDays === 0) {
    // 今日期限
    return 'text-red-500';
  } else if (diffDays <= 3) {
    // 3日以内
    return 'text-orange-500';
  } else if (diffDays <= 7) {
    // 1週間以内
    return 'text-yellow-600';
  } else {
    // 余裕あり
    return 'text-neutral-600';
  }
}
