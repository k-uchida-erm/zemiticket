"use client";

import { useState, useEffect } from 'react';
import { ParentTask, SubTask, SubTodo } from '../../types';
import SectionTitle from '../../components/atoms/SectionTitle';
import Ticket from '../../components/atoms/icons/Ticket';

interface TicketGroup {
	epic: string;
	list: Array<{
		parent: ParentTask;
		children: SubTask[];
	}>;
}

export default function TicketMap() {
  const [ticketsData, setTicketsData] = useState<TicketGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [draggedTicket, setDraggedTicket] = useState<{ id: string; fromStatus: string } | null>(null);
  const [ticketsByStatus, setTicketsByStatus] = useState({
    todo: [] as ParentTask[],
    active: [] as ParentTask[],
    in_review: [] as ParentTask[],
    completed: [] as ParentTask[]
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tickets/all');
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setTicketsData(result.data);
            // データをステータス別に分類（現在は全てtodoとして扱う）
            const newTicketsByStatus = {
              todo: [] as ParentTask[],
              active: [] as ParentTask[],
              in_review: [] as ParentTask[],
              completed: [] as ParentTask[]
            };
            
            result.data.forEach((epicGroup: TicketGroup) => {
              epicGroup.list?.forEach((item: { parent: ParentTask; children: SubTask[] }) => {
                if (item.parent) {
                  // 現在は全てtodoステータスとして扱う（将来的にDBから取得）
                  newTicketsByStatus.todo.push(item.parent);
                }
              });
            });
            
            setTicketsByStatus(newTicketsByStatus);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 利用可能な幅を動的に計算
  useEffect(() => {
    const updateWidth = () => {
      // サイドバーの実際の幅を取得
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const sidebarWidth = sidebarRect.width;
        const windowWidth = window.innerWidth;
        const availableWidth = windowWidth - sidebarWidth - 48; // 48px for page padding
        setAvailableWidth(availableWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    // サイドバーの状態変更を定期的にチェック
    const interval = setInterval(updateWidth, 100);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearInterval(interval);
    };
  }, []);

  // 動的にカラム幅と間隔を計算
  const calculateLayout = () => {
    if (availableWidth === 0) return { columnWidth: 280, gap: 16 };
    
    const numColumns = 4;
    const totalGaps = numColumns - 1;
    const minGap = 16; // 最小間隔を16pxに増加
    const maxGap = 24; // 最大間隔を24pxに増加
    
    // 利用可能な幅から最適な間隔を計算（左右のパディングを考慮）
    const availableContentWidth = availableWidth - 48; // 左右のパディング（左24px + 右24px）を引く
    
    // 固定の間隔を使用してカラム幅を最大化
    const gap = minGap;
    const columnWidth = (availableContentWidth - (totalGaps * gap)) / numColumns;
    
    return { columnWidth: Math.floor(columnWidth), gap };
  };

  const { columnWidth, gap } = calculateLayout();

  const statusConfig = {
    todo: { title: 'To Do', dotColor: 'bg-neutral-400', countBgColor: 'bg-neutral-200', countTextColor: 'text-neutral-600' },
    active: { title: 'Active', dotColor: 'bg-orange-500', countBgColor: 'bg-orange-500/20', countTextColor: 'text-orange-600' },
    in_review: { title: 'In Review', dotColor: 'bg-blue-500', countBgColor: 'bg-blue-500/20', countTextColor: 'text-blue-600' },
    completed: { title: 'Completed', dotColor: 'bg-[#00b393]', countBgColor: 'bg-[#00b393]/20', countTextColor: 'text-[#00b393]' }
  };

  // ドラッグ&ドロップハンドラー
  const handleDragStart = (e: React.DragEvent, ticketId: string, fromStatus: string) => {
    setDraggedTicket({ id: ticketId, fromStatus });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.fromStatus !== targetStatus) {
      // チケットを移動
      setTicketsByStatus(prev => {
        const newState = { ...prev };
        
        // 元のステータスから削除
        newState[draggedTicket.fromStatus as keyof typeof prev] = prev[draggedTicket.fromStatus as keyof typeof prev].filter(
          (ticket: ParentTask) => ticket.id !== draggedTicket.id
        );
        
        // 新しいステータスに追加
        const ticketToMove = prev[draggedTicket.fromStatus as keyof typeof prev].find(
          (ticket: ParentTask) => ticket.id === draggedTicket.id
        );
        
        if (ticketToMove) {
          newState[targetStatus as keyof typeof prev] = [...prev[targetStatus as keyof typeof prev], ticketToMove];
        }
        
        return newState;
      });
    }
    setDraggedTicket(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-600">Loading ticket map...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <SectionTitle icon={<Ticket />}>
        Ticket Map
      </SectionTitle>

      {/* 看板ボード - 動的幅調整 */}
      <div className="overflow-x-auto -mx-6">
        <div className="flex pb-4 pl-6 pr-2" style={{ gap: `${gap}px` }}>
          {Object.entries(statusConfig).map(([status, config]) => (
            <div 
              key={status} 
              className="flex-shrink-0 relative" 
              style={{ width: `${columnWidth}px` }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >

              
              {/* カラムヘッダー */}
              <div className="flex items-center gap-2 mb-3 pl-2">
                <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
                <h5 className="text-xs font-medium text-neutral-600">{config.title}</h5>
                <span className={`text-xs ${config.countBgColor} ${config.countTextColor} px-1.5 py-0.5 rounded-full`}>
                  {ticketsByStatus[status as keyof typeof ticketsByStatus].length}
                </span>
              </div>

              {/* チケットカード */}
              <div className="space-y-2 pl-0.5 pr-0.5">
                {ticketsByStatus[status as keyof typeof ticketsByStatus].map((ticket: ParentTask) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-md border border-neutral-200 p-1.5 shadow-sm hover:shadow-md transition-shadow cursor-move min-h-[56px] relative"
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket.id.toString(), status)}
                    style={{
                      opacity: draggedTicket?.id === ticket.id.toString() ? 0.5 : 1
                    }}
                  >
                    {/* エピックラベル */}
                    {ticket.epic && (
                      <div className="-mt-0.5 mb-1">
                          <span className="inline-flex items-center text-[10px] px-1 py-[1px] rounded-full border border-neutral-300 text-neutral-700 bg-white">
                            {ticket.epic}
                          </span>
                        </div>
                      )}

                    {/* チケットタイトル行 */}
                    <div className="flex items-start justify-between gap-2 mt-0">
                      <div className="min-w-0 flex items-center gap-2">
                        <h4 className="text-xs leading-4 font-semibold tracking-tight text-neutral-800 truncate">
                          {ticket.title}
                        </h4>
                        {typeof ticket.estimateHours === 'number' && (
                          <span className="shrink-0 text-[9px] px-1 py-[1px] rounded-full bg-indigo-700 text-white">
                            {ticket.estimateHours}h
                          </span>
                        )}
                      </div>
                    </div>

                    {/* チケット詳細 */}
                    {ticket.description && (
                      <p className="mt-0.5 text-[9px] leading-4 text-neutral-600 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                ))}

                {/* 空の状態 */}
                {ticketsByStatus[status as keyof typeof ticketsByStatus].length === 0 && (
                  <div className="flex items-start justify-start h-24 text-neutral-400 text-sm pl-2 pt-2">
                    チケットがありません
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}