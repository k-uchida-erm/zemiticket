import { UserWorkspace, Workspace } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface PermissionCheck {
  canViewWorkspace: boolean;
  canViewAllTickets: boolean;
  canViewMyTickets: boolean;
  canManageWorkspace: boolean;
}

export function checkPermissions(
  user: User | null,
  currentWorkspace: Workspace | null,
  userWorkspaces: UserWorkspace[]
): PermissionCheck {
  if (!user || !currentWorkspace) {
    return {
      canViewWorkspace: false,
      canViewAllTickets: false,
      canViewMyTickets: false,
      canManageWorkspace: false,
    };
  }

  // ユーザーがそのワークスペースに所属しているかチェック
  const userWorkspace = userWorkspaces.find(uw => uw.workspace?.id === currentWorkspace.id);
  const isMember = !!userWorkspace;
  const isOwner = userWorkspace?.role === 'owner';
  const isAdmin = userWorkspace?.role === 'admin';

  return {
    canViewWorkspace: isMember,
    // 全員がALLフィルターを使用可能
    canViewAllTickets: isMember,
    canViewMyTickets: isMember,
    canManageWorkspace: isOwner || (user.role === 'teacher' && isAdmin),
  };
}

export function getFilterOptions(permissions: PermissionCheck): Array<{ value: 'MY' | 'ALL'; label: string }> {
  const options: Array<{ value: 'MY' | 'ALL'; label: string }> = [{ value: 'MY', label: 'MY' }];

  if (permissions.canViewAllTickets) {
    options.push({ value: 'ALL', label: 'ALL' });
  }

  return options;
}
