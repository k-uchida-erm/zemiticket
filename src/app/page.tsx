"use client";

import LoadingSpinner from '../components/atoms/LoadingSpinner';
import HomeLayout from '../components/organisms/HomeLayout';
import { ParentTask, SubTask } from '../types';
import { mockActiveGroups, mockSubmittingTickets, mockOthersGrouped } from '../data/mockData';
import { useEffect, useState } from 'react';

export default function Home() {
  const [activeGroups, setActiveGroups] = useState<{ parent: ParentTask; children: SubTask[] }[]>([]);
  const [submittingTickets, setSubmittingTickets] = useState<Array<ParentTask & { children?: SubTask[] }>>([]);
  const [othersGrouped, setOthersGrouped] = useState<{ user: string; tickets: Array<ParentTask & { children?: SubTask[] }> }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  // データ取得
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/home');
        if (!response.ok) {
          throw new Error('Failed to fetch home data');
        }
        const result = await response.json();
        
        // データの安全性を確保
        setActiveGroups(result.activeGroups || []);
        setSubmittingTickets(result.submittingTickets || []);
        setOthersGrouped(result.othersGrouped || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
        // エラー時はモックデータを使用
        setActiveGroups(mockActiveGroups);
        setSubmittingTickets(mockSubmittingTickets);
        setOthersGrouped(mockOthersGrouped);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();

    // データ更新イベントを監視
    const handleDataUpdate = () => {
      fetchHomeData();
    };

    window.addEventListener('ticketDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('ticketDataUpdated', handleDataUpdate);
    };
  }, []);

  // モックデータを使用する場合
  useEffect(() => {
    if (useMockData) {
      setActiveGroups(mockActiveGroups);
      setSubmittingTickets(mockSubmittingTickets);
      setOthersGrouped(mockOthersGrouped);
    }
  }, [useMockData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <HomeLayout
      activeGroups={activeGroups}
      submittingTickets={submittingTickets}
      othersGrouped={othersGrouped}
    />
  );
}
