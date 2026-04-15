import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/api/tasks', () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  getAllTasks: vi.fn(),
  updateTask: vi.fn(),
}));

import { useTaskStore } from '@/stores/taskStore';
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  updateTask as updateTaskApi,
} from '@/api/tasks';

describe('taskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('has the expected initial state', () => {
    const store = useTaskStore();

    expect(store.tasks).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('addTask appends a task to state', async () => {
    const store = useTaskStore();
    const createdTask = {
      id: 'task-1',
      title: 'Write tests',
      status: 'todo',
      priority: 'high',
    };

    createTaskApi.mockResolvedValue(createdTask);

    await store.addTask(createdTask);

    expect(createTaskApi).toHaveBeenCalledWith(createdTask);
    expect(store.tasks).toEqual([createdTask]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('removeTask removes the correct task by id', async () => {
    const store = useTaskStore();
    store.tasks = [
      { id: 'task-1', title: 'Keep me', status: 'todo', priority: 'low' },
      { id: 'task-2', title: 'Remove me', status: 'todo', priority: 'high' },
    ];

    deleteTaskApi.mockResolvedValue({});

    await store.removeTask('task-2');

    expect(deleteTaskApi).toHaveBeenCalledWith('task-2');
    expect(store.tasks).toEqual([
      { id: 'task-1', title: 'Keep me', status: 'todo', priority: 'low' },
    ]);
  });

  it('updateTask replaces the correct task in state', async () => {
    const store = useTaskStore();
    store.tasks = [
      { id: 'task-1', title: 'Original', status: 'todo', priority: 'medium' },
      { id: 'task-2', title: 'Other', status: 'in_progress', priority: 'high' },
    ];

    const updatedTask = {
      id: 'task-1',
      title: 'Updated',
      status: 'completed',
      priority: 'medium',
    };

    updateTaskApi.mockResolvedValue(updatedTask);

    await store.updateTask('task-1', updatedTask);

    expect(updateTaskApi).toHaveBeenCalledWith('task-1', updatedTask);
    expect(store.tasks).toEqual([
      updatedTask,
      { id: 'task-2', title: 'Other', status: 'in_progress', priority: 'high' },
    ]);
  });

  it('changeStatus updates a task status', async () => {
    const store = useTaskStore();
    store.tasks = [
      {
        id: 'task-1',
        title: 'Ship feature',
        status: 'todo',
        priority: 'high',
        subtasks: [{ title: 'QA', done: false }],
      },
    ];

    updateTaskApi.mockResolvedValue({
      id: 'task-1',
      title: 'Ship feature',
      status: 'completed',
      priority: 'high',
      subtasks: [{ title: 'QA', done: true }],
    });

    await store.changeStatus('task-1', 'completed');

    expect(updateTaskApi).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({
        id: 'task-1',
        status: 'completed',
      })
    );
    expect(store.tasks[0].status).toBe('completed');
  });

  it('filteredTasks getter filters by search keyword using title matches', () => {
    const store = useTaskStore();
    store.tasks = [
      { id: 'task-1', title: 'Design system', priority: 'high' },
      { id: 'task-2', title: 'API cleanup', priority: 'medium' },
    ];

    const result = store.filteredTasks('design');

    expect(result).toEqual([{ id: 'task-1', title: 'Design system', priority: 'high' }]);
  });

  it('filteredTasks getter filters by priority', () => {
    const store = useTaskStore();
    store.tasks = [
      { id: 'task-1', title: 'Design system', priority: 'high' },
      { id: 'task-2', title: 'API cleanup', priority: 'low' },
      { id: 'task-3', title: 'Write docs', priority: 'high' },
    ];

    const result = store.filteredTasks('', 'high');

    expect(result).toEqual([
      { id: 'task-1', title: 'Design system', priority: 'high' },
      { id: 'task-3', title: 'Write docs', priority: 'high' },
    ]);
  });

  it('taskStats getter returns the correct totals and progress percent', () => {
    const store = useTaskStore();
    store.tasks = [
      { id: 'task-1', status: 'completed' },
      { id: 'task-2', status: 'completed' },
      { id: 'task-3', status: 'todo' },
      { id: 'task-4', status: 'in_progress' },
    ];

    expect(store.taskStats).toEqual({
      total: 4,
      todo: 1,
      inProgress: 1,
      completed: 2,
      progressPct: 50,
    });
  });
});
