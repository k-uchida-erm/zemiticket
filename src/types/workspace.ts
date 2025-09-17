export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner_id: string;
}

export interface WorkspaceMember {
  user_id: string;
  workspace_id: string;
  role: 'owner' | 'member' | 'admin';
  joined_at: string;
}

export interface UserWorkspace {
  workspace: Workspace;
  member: WorkspaceMember;
}

