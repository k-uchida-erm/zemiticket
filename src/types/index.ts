export type TaskType = 'experiment' | 'analysis' | 'writing' | 'review' | 'admin' | 'setup';
export type ReviewDecision = 'approved' | 'rework' | 'pending';

export interface ArtifactRef {
  label: string;
  url?: string;
}

export interface ExperimentMeta {
  device?: string;
  params?: Record<string, string>;
  dataset?: string;
  subjectCount?: number;
  environment?: string;
}

export interface Task {
  id: number;
  title: string;
  user: string;
  description?: string;
  slug?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  commentsCount?: number;
  updatedAt?: string; // ISO string or relative
  epic?: string;

  // Research-oriented fields
  type?: TaskType;
  assignees?: string[];
  reviewers?: string[];
  estimateHours?: number;
  actualHours?: number;
  dependencies?: string[]; // list of ticket slugs this depends on
  artifacts?: ArtifactRef[];
  hypothesis?: string;
  successCriteria?: string;
  experiment?: ExperimentMeta;
  irbId?: string;
  protocolVersion?: string;

  // Review
  reviewDecision?: ReviewDecision;
  reviewComments?: { author: string; text: string; at?: string }[];
}

export interface SubTodo {
  id: number;
  title: string;
  done?: boolean;
  due?: string;
  estimateHours?: number;
  inProgress?: boolean;
}

export interface SubTask extends Task {
  due?: string;
  done?: boolean;
  todos?: SubTodo[];
}

export interface ParentTask extends Task {
  due?: string;
  progressPercentage?: number;
} 