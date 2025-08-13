import { Task } from '../../../types';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
      <p className="text-sm text-gray-600">担当者: {task.user}</p>
    </div>
  );
} 