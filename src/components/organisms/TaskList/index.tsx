import TaskCard from '../../molecules/TaskCard';
import { Task } from '../../../types';

interface TaskListProps {
  title: string;
  tasks: Task[];
}

export default function TaskList({ title, tasks }: TaskListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
} 