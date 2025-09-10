// 新しい無限階層チケットシステムの型定義

export interface Ticket {
  id: string;
  workspace_id: string;
  research_topic_id?: string | null;
  parent_id?: string | null;  // 親チケットのID（NULLの場合はルートチケット）
  title: string;
  description?: string;
  slug: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'completed' | 'active';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user_id?: string | null;
  due_date?: string | null;
  progress_percentage: number;  // 0-100
  estimate_hours?: number | null;
  actual_hours?: number | null;
  type?: 'task' | 'subtask' | 'experiment' | 'analysis' | 'admin';
  comments_count: number;
  created_at: string;
  updated_at: string;
  sort_order: number;
  is_active: boolean;
  level: number;  // 階層レベル（0=ルート、1=子、2=孫...）

  // 関連データ（APIから取得時に含まれる）
  children?: Ticket[];  // 子チケット
  todos?: Todo[];  // このチケットに直接属するTODO
  parent?: Ticket;  // 親チケット（必要に応じて）
}

export interface Todo {
  id: string;
  ticket_id: string;  // 所属するチケットのID
  title: string;
  description?: string;
  done: boolean;
  in_progress: boolean;
  estimate_hours?: number;
  created_at: string;
  updated_at: string;
  sort_order: number;
  progress_value?: number;
}

// 階層クエリ用の型
export interface TicketHierarchy {
  ticket: Ticket;
  children: TicketHierarchy[];
  todos: Todo[];
}

// チケット作成用の型
export interface CreateTicketRequest {
  parent_id?: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  user_id?: string;
  epic_id?: string;
  due_date?: string;
  estimate_hours?: number;
  type?: string;
}

// チケット更新用の型
export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  user_id?: string;
  epic_id?: string;
  due_date?: string;
  progress_percentage?: number;
  estimate_hours?: number;
  actual_hours?: number;
  type?: string;
  is_active?: boolean;
  sort_order?: number;
}

// 階層表示用の型
export interface TicketTreeNode {
  ticket: Ticket;
  children: TicketTreeNode[];
  todos: Todo[];
  isExpanded?: boolean;
  isSelected?: boolean;
}

// フィルタリング用の型
export interface TicketFilters {
  status?: string[];
  priority?: string[];
  user_id?: string;
  epic_id?: string;
  level?: number;
  is_active?: boolean;
  search?: string;
}

// ソート用の型
export interface TicketSort {
  field: 'title' | 'status' | 'priority' | 'due_date' | 'created_at' | 'updated_at' | 'level';
  direction: 'asc' | 'desc';
}
