"use client";

import { useState, useCallback, useEffect } from 'react';
import { SubTask } from '../../../types';
import Card from '../../atoms/Card';
import Link from 'next/link';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import IconCheck from '../../atoms/icons/Check';
import StatusDot from '../../atoms/StatusDot';

interface SubTicketCardProps {
  ticket: SubTask;
  compact?: boolean;
  variant?: 'card' | 'flat';
  readOnly?: boolean;
  disableLink?: boolean;
}

export default function SubTicketCard({ ticket, compact = true, variant = 'card', readOnly = false, disableLink = false }: SubTicketCardProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(readOnly ? true : !!ticket.done);
  // sort_order順でソートして順番を固定
  const [todos, setTodos] = useState(() => {
    if (ticket.todos && Array.isArray(ticket.todos)) {
      // sort_order順でソートして順番を固定
      return [...ticket.todos].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    return [];
  });

  // 初期化時の完了状態設定
  useEffect(() => {
    if (todos.length > 0) {
      const allTodosDone = todos.every(todo => todo.done === true);
      setDone(allTodosDone);
    } else {
      setDone(readOnly ? true : !!ticket.done);
    }
  }, [readOnly, ticket.done]);

  // todosの変更を監視してサブタスクの完了状態を自動更新
  useEffect(() => {
    console.log('useEffect triggered - todos:', todos);
    if (todos.length > 0) {
      // サブタスク内の全todosが完了しているかチェック
      const allTodosDone = todos.every(todo => todo.done === true);
      console.log('allTodosDone:', allTodosDone, 'current done:', done);
      console.log('Setting done to:', allTodosDone);
      setDone(allTodosDone);
    }
  }, [todos]);

  // doneの状態変更を監視
  useEffect(() => {
    console.log('Done state changed to:', done);
  }, [done]);

  const onToggleSub = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setDone((v) => !v);
  };

  const onToggleTodo = (id: number) => async (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    
    // 現在のtodoの状態を取得
    const currentTodo = todos.find(t => t.id === id);
    if (!currentTodo) return;
    
    const newDoneState = !currentTodo.done;
    console.log('onToggleTodo called - id:', id, 'currentDone:', currentTodo.done, 'newDoneState:', newDoneState);
    
    try {
      // ローカル状態を即座に更新（楽観的更新）- 順番を維持
      const updatedTodos = todos.map((t) => (t.id === id ? { ...t, done: newDoneState } : t));
      console.log('Updating todos state:', updatedTodos);
      setTodos(updatedTodos);
      
      // 強制的にサブタスクの完了状態を更新
      const allTodosDone = updatedTodos.every(todo => todo.done === true);
      console.log('Immediately updating done to:', allTodosDone);
      setDone(allTodosDone);
      
      // DBに保存
      console.log('Sending API request:', { todoId: id, done: newDoneState });
      const response = await fetch('/api/todos/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todoId: id,
          done: newDoneState
        }),
      });
      
      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);
      
      if (!response.ok) {
        // エラーが発生した場合は元の状態に戻す
        const revertedTodos = todos.map((t) => (t.id === id ? { ...t, done: currentTodo.done } : t));
        setTodos(revertedTodos);
        const errorText = await response.text();
        console.error('Failed to update todo:', response.status, errorText);
      } else {
        // 成功した場合、親タスクの進捗を更新するためにイベントを発火
        console.log('Dispatching todoProgressUpdated event:', { todoId: id, done: newDoneState });
        window.dispatchEvent(new CustomEvent('todoProgressUpdated', {
          detail: { todoId: id, done: newDoneState }
        }));
      }
    } catch (error) {
      // エラーが発生した場合は元の状態に戻す
      const revertedTodos = todos.map((t) => (t.id === id ? { ...t, done: currentTodo.done } : t));
      setTodos(revertedTodos);
      console.error('Error updating todo:', error);
    }
  };

  const TitleRow = (
    <div className="min-w-0 flex items-center gap-2">
      <p className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-normal text-neutral-900 truncate`}>{ticket.title}</p>
      {typeof ticket.estimateHours === 'number' && (
        <span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-pink-500 text-white">{ticket.estimateHours}h</span>
      )}
      {Array.isArray(todos) && todos.length > 0 && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
          aria-expanded={open}
          className="ml-1 h-5 w-5 inline-flex items-center justify-center rounded text-neutral-600 hover:bg-neutral-50 shrink-0"
        >
          <IconChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );

  const Todos = open && Array.isArray(todos) && todos.length > 0 && (
    <div className="mt-0 pl-6 pb-0">
      <ul className="space-y-0 divide-y divide-neutral-200">
        {todos.map((t, index) => (
          <li key={`${t.id}-${index}`} className={index === todos.length - 1 ? 'border-b-0' : ''}>
            <div 
              className="flex items-center justify-between text-[12px] text-neutral-700 px-1 py-1.5 cursor-pointer hover:bg-neutral-50"
              onClick={readOnly ? undefined : onToggleTodo(t.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <StatusDot completed={readOnly ? true : !!t.done} variant="todo" onClick={readOnly ? undefined : onToggleTodo(t.id)} disabled={readOnly} className={readOnly ? 'cursor-default' : ''} />
                <span className="truncate">{t.title}</span>
                {typeof t.estimateHours === 'number' && (
                  <span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-amber-400 text-white">{t.estimateHours}h</span>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2 text-neutral-500">
                {t.due && <span>due {t.due}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  if (variant === 'flat') {
    const row = (
      <div className="w-full">
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <div className="flex items-center gap-2 min-w-0">
          {/* 完了時のみチェックマークを表示、未完了時は何も表示しない */}
          {done && (
            <div className="shrink-0">
              <StatusDot completed={true} variant="todo" disabled={true} className="cursor-default" />
            </div>
          )}
            <div className="flex-1 min-w-0">{TitleRow}</div>
          </div>
        </div>
        {Todos}
      </div>
    );
    return row; // リンクを削除
  }

  const body = (
    <Card className={`w-full max-w-full ${compact ? 'pr-1.5 pl-3 py-1.5' : 'p-3'}`}>
      <div className="flex items-center justify-between gap-2 px-1 py-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* 完了時のみチェックマークを表示、未完了時は何も表示しない */}
          {done && (
            <div className="shrink-0">
              <StatusDot completed={true} variant="todo" disabled={true} className="cursor-default" />
            </div>
          )}
          <div className="flex-1 min-w-0">{TitleRow}</div>
        </div>
      </div>
      {Todos}
    </Card>
  );

  return body; // リンクを削除
} 