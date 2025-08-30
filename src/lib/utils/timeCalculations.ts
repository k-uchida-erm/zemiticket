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
		// estimate_hoursフィールドから値を取得（Supabaseの命名規則）
		const estimateHours = (todo as { estimate_hours?: number }).estimate_hours;
		return total + (estimateHours || 0);
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

		// サブタスクのestimateHoursを計算
		const subTaskEstimateHours = sortedTodos.reduce((total: number, todo: SubTodo) => {
			const estimateHours = (todo as { estimate_hours?: number }).estimate_hours;
			return total + (estimateHours || 0);
		}, 0);

		return {
			...subTask,
			estimateHours: subTaskEstimateHours,  // サブタスクの時間を設定
			todos: sortedTodos.map((todo: SubTodo) => ({
				...todo,
				estimateHours: (todo as { estimate_hours?: number }).estimate_hours || 0
			}))
		};
	});

	// 親タスクのestimateHoursを計算
	const totalEstimateHours = processedSubTasks.reduce((total: number, subTask: SubTask) => {
		return total + (subTask.estimateHours || 0);
	}, 0);

	return {
		parent: {
			...parentTask,
			user: parentTask.user || 'Unknown',
			estimateHours: totalEstimateHours,
			progressPercentage: (parentTask as { progress_percentage?: number }).progress_percentage || 0,  // progress_percentageをprogressPercentageに変換
			sub_tasks: processedSubTasks
		},
		children: processedSubTasks
	};
} 
 
 
 
 
 
 
 
 
 
 