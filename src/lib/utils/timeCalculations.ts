import type { ParentTask, SubTask, SubTodo } from '../../types';

/**
 * 時間計算の共通関数
 */

// サブタスク内のTODOの時間の総和を計算
export function calculateSubTaskHours(subTask: SubTask): number {
	if (!subTask.todos || subTask.todos.length === 0) {
		return 0;
	}
	
	return subTask.todos.reduce((total: number, todo: SubTodo) => {
		return total + (todo.estimateHours || 0);
	}, 0);
}

// 親タスク内の全TODOの時間の総和を計算
export function calculateParentTaskHours(parentTask: ParentTask): number {
	if (!parentTask.sub_tasks || parentTask.sub_tasks.length === 0) {
		return 0;
	}
	
	return parentTask.sub_tasks.reduce((total: number, subTask: SubTask) => {
		return total + calculateSubTaskHours(subTask);
	}, 0);
}

// データをフロントエンド用の形式に変換（時間計算込み）
export function transformTaskData(parentTask: ParentTask) {
	// サブタスクをソート
	const sortedSubTasks = parentTask.sub_tasks?.sort((a: SubTask, b: SubTask) => {
		if (a.sort_order !== undefined && b.sort_order !== undefined) {
			return a.sort_order - b.sort_order;
		}
		return 0;
	}) || [];

	// 各サブタスクのtodosをソート
	const processedSubTasks = sortedSubTasks.map((subTask: SubTask) => {
		const sortedTodos = subTask.todos?.sort((a: SubTodo, b: SubTodo) => {
			if (a.sort_order !== undefined && b.sort_order !== undefined) {
				return a.sort_order - b.sort_order;
			}
			return 0;
		}) || [];

		return {
			...subTask,
			todos: sortedTodos.map((todo: SubTodo) => ({
				...todo,
				estimateHours: todo.estimateHours || 0
			}))
		};
	});

	return {
		...parentTask,
		sub_tasks: processedSubTasks
	};
} 
 
 
 
 
 
 
 
 
 
 