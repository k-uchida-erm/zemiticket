import {
	calcProgress,
	calculateParentTaskHours,
	calculateSubTaskHours,
} from '../../src/lib/utils/timeCalculations';
import type { ParentTask, SubTask, SubTodo } from '../../src/types';

describe('時間計算関数のテスト', () => {
	describe('calcProgress', () => {
		it('空のリストの場合は0を返す', () => {
			const result = calcProgress([]);
			expect(result).toBe(0);
		});

		it('TODOがない場合は0を返す', () => {
			const subtasks: SubTask[] = [
				{ id: '1', title: 'テスト', todos: [] } as SubTask,
			];
			const result = calcProgress(subtasks);
			expect(result).toBe(0);
		});

		it('完了したTODOの割合を正しく計算する', () => {
			const subtasks: SubTask[] = [
				{
					id: '1',
					title: 'テスト1',
					todos: [
						{ id: '1', title: 'TODO1', done: true } as SubTodo,
						{ id: '2', title: 'TODO2', done: false } as SubTodo,
						{ id: '3', title: 'TODO3', done: true } as SubTodo,
					],
				} as SubTask,
			];
			const result = calcProgress(subtasks);
			expect(result).toBe(67); // 3個中2個完了 = 67%
		});

		it('複数のサブタスクの進捗を正しく計算する', () => {
			const subtasks: SubTask[] = [
				{
					id: '1',
					title: 'テスト1',
					todos: [
						{ id: '1', title: 'TODO1', done: true } as SubTodo,
						{ id: '2', title: 'TODO2', done: true } as SubTodo,
					],
				} as SubTask,
				{
					id: '2',
					title: 'テスト2',
					todos: [
						{ id: '3', title: 'TODO3', done: false } as SubTodo,
						{ id: '4', title: 'TODO4', done: false } as SubTodo,
					],
				} as SubTask,
			];
			const result = calcProgress(subtasks);
			expect(result).toBe(50); // 4個中2個完了 = 50%
		});
	});

	describe('calculateSubTaskHours', () => {
		it('TODOがない場合は0を返す', () => {
			const subtask: SubTask = {
				id: '1',
				title: 'テスト',
				todos: [],
			} as SubTask;
			const result = calculateSubTaskHours(subtask);
			expect(result).toBe(0);
		});

		it('TODOの時間を正しく合計する', () => {
			const subtask: SubTask = {
				id: '1',
				title: 'テスト',
				todos: [
					{ id: '1', title: 'TODO1', estimateHours: 2.5 } as SubTodo,
					{ id: '2', title: 'TODO2', estimateHours: 1.5 } as SubTodo,
					{ id: '3', title: 'TODO3', estimateHours: 3.0 } as SubTodo,
				],
			} as SubTask;
			const result = calculateSubTaskHours(subtask);
			expect(result).toBe(7.0);
		});
	});

	describe('calculateParentTaskHours', () => {
		it('サブタスクがない場合は0を返す', () => {
			const parentTask: ParentTask = {
				id: '1',
				title: 'テスト',
				sub_tasks: [],
			} as ParentTask;
			const result = calculateParentTaskHours(parentTask);
			expect(result).toBe(0);
		});

		it('全サブタスクの時間を正しく合計する', () => {
			const parentTask: ParentTask = {
				id: '1',
				title: 'テスト',
				sub_tasks: [
					{
						id: '1',
						title: 'サブタスク1',
						todos: [
							{ id: '1', title: 'TODO1', estimateHours: 2.0 } as SubTodo,
							{ id: '2', title: 'TODO2', estimateHours: 1.5 } as SubTodo,
						],
					} as SubTask,
					{
						id: '2',
						title: 'サブタスク2',
						todos: [{ id: '3', title: 'TODO3', estimateHours: 3.0 } as SubTodo],
					} as SubTask,
				],
			} as ParentTask;
			const result = calculateParentTaskHours(parentTask);
			expect(result).toBe(6.5); // 2.0 + 1.5 + 3.0 = 6.5
		});
	});
});
