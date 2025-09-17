'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserWorkspace, Workspace } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  currentWorkspace: Workspace | null;
  userWorkspaces: UserWorkspace[];
  login: (user: User) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchWorkspace: (workspaceId: string) => void;
  availableUsers: User[];
  refreshWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<UserWorkspace[]>([]);

  // 利用可能なユーザー一覧（開発用）
  const availableUsers: User[] = [
    {
      id: 'b4c82595-bdef-4724-abbe-d7636f06defc',
      name: '田中太郎',
      email: 'tanaka@klab.example.com',
      role: 'student'
    },
    {
      id: 'user-001',
      name: '佐藤花子',
      email: 'sato@klab.example.com',
      role: 'student'
    },
    {
      id: 'user-002',
      name: '山田先生',
      email: 'yamada@klab.example.com',
      role: 'teacher'
    }
  ];

  // ワークスペース情報を取得する関数
  const refreshWorkspaces = React.useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user-workspaces?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserWorkspaces(data.workspaces || []);

        // 現在のワークスペースが設定されていない場合、最初のワークスペースを選択
        if (!currentWorkspace && data.workspaces && data.workspaces.length > 0) {
          setCurrentWorkspace(data.workspaces[0].workspace);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
	}, [user, currentWorkspace, availableUsers]);

  useEffect(() => {
    // デフォルトで田中太郎でログイン（開発用）
    const defaultUser = availableUsers[0];
    setUser(defaultUser);
    setIsAuthenticated(true);
  }, []);

  // ユーザーが変更されたときにワークスペース情報を取得
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshWorkspaces();
    }
  }, [isAuthenticated, user, refreshWorkspaces]);

  const login = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchUser = (userId: string) => {
    const targetUser = availableUsers.find(u => u.id === userId);
    if (targetUser) {
      setUser(targetUser);
      setIsAuthenticated(true);
      setCurrentWorkspace(null); // ワークスペースをリセット
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const targetWorkspace = userWorkspaces.find(uw => uw.workspace?.id === workspaceId);
    if (targetWorkspace?.workspace) {
      setCurrentWorkspace(targetWorkspace.workspace);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      currentWorkspace,
      userWorkspaces,
      login,
      logout,
      switchUser,
      switchWorkspace,
      availableUsers,
      refreshWorkspaces
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
