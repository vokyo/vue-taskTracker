import { defineStore } from 'pinia';
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getAllTasks,
  updateTask as updateTaskApi,
} from '@/api/tasks';

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    tasks: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    tasksByStatus: (state) => (status) =>
      state.tasks.filter((task) => task.status === status),

    tasksByProject: (state) => (projectId) =>
      state.tasks.filter((task) => String(task.projectId) === String(projectId)),

    taskStats: (state) => {
      const total = state.tasks.length;
      const todo = state.tasks.filter((task) => task.status === 'todo').length;
      const inProgress = state.tasks.filter(
        (task) => task.status === 'in_progress'
      ).length;
      const completed = state.tasks.filter(
        (task) => task.status === 'completed'
      ).length;
      const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        total,
        todo,
        inProgress,
        completed,
        progressPct,
      };
    },

    filteredTasks: (state) => (search = '', priority = '') => {
      const normalizedSearch = search.trim().toLowerCase();
      const normalizedPriority = priority.trim().toLowerCase();

      return state.tasks.filter((task) => {
        const title = task.title?.toLowerCase?.() ?? '';
        const description = task.description?.toLowerCase?.() ?? '';
        const category = task.category?.toLowerCase?.() ?? '';
        const assignee = task.assignee?.toLowerCase?.() ?? '';
        const tags = Array.isArray(task.tags) ? task.tags : [];

        const matchesSearch =
          normalizedSearch === '' ||
          title.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          category.includes(normalizedSearch) ||
          assignee.includes(normalizedSearch) ||
          tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

        const matchesPriority =
          normalizedPriority === '' ||
          normalizedPriority === 'all' ||
          task.priority?.toLowerCase?.() === normalizedPriority;

        return matchesSearch && matchesPriority;
      });
    },
  },

  actions: {
    async fetchTasks() {
      this.isLoading = true;
      this.error = null;

      try {
        const tasks = await getAllTasks();
        this.tasks = tasks;
        return tasks;
      } catch (error) {
        this.error = error.message || 'Failed to fetch tasks';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addTask(task) {
      this.isLoading = true;
      this.error = null;

      try {
        const createdTask = await createTaskApi(task);
        this.tasks.push(createdTask);
        return createdTask;
      } catch (error) {
        this.error = error.message || 'Failed to add task';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateTask(id, data) {
      this.isLoading = true;
      this.error = null;

      try {
        const updatedTask = await updateTaskApi(id, data);
        const taskIndex = this.tasks.findIndex((task) => task.id === id);

        if (taskIndex !== -1) {
          this.tasks.splice(taskIndex, 1, updatedTask);
        } else {
          this.tasks.push(updatedTask);
        }

        return updatedTask;
      } catch (error) {
        this.error = error.message || 'Failed to update task';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async removeTask(id) {
      this.isLoading = true;
      this.error = null;

      try {
        await deleteTaskApi(id);
        this.tasks = this.tasks.filter((task) => task.id !== id);
      } catch (error) {
        this.error = error.message || 'Failed to remove task';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async changeStatus(id, status) {
      this.isLoading = true;
      this.error = null;

      try {
        const existingTask = this.tasks.find((task) => task.id === id);

        if (!existingTask) {
          throw new Error('Task not found');
        }

        const currentSubtasks = Array.isArray(existingTask.subtasks)
          ? existingTask.subtasks
          : [];

        let nextSubtasks = currentSubtasks;
        let subtaskMessage = null;

        if (status === 'completed') {
          const undoneCount = currentSubtasks.filter(
            (subtask) => !subtask.done
          ).length;

          if (undoneCount > 0) {
            nextSubtasks = currentSubtasks.map((subtask) => ({
              ...subtask,
              done: true,
            }));
            subtaskMessage = `Automatically marked ${undoneCount} subtasks as done`;
          }
        } else if (status === 'todo') {
          const doneCount = currentSubtasks.filter((subtask) => subtask.done).length;

          if (doneCount > 0) {
            nextSubtasks = currentSubtasks.map((subtask) => ({
              ...subtask,
              done: false,
            }));
            subtaskMessage = `Reset ${doneCount} subtasks to incomplete`;
          }
        }

        const updatedTask = await updateTaskApi(id, {
          ...existingTask,
          status,
          subtasks: nextSubtasks,
        });

        const taskIndex = this.tasks.findIndex((task) => task.id === id);

        if (taskIndex !== -1) {
          this.tasks.splice(taskIndex, 1, updatedTask);
        } else {
          this.tasks.push(updatedTask);
        }

        return subtaskMessage;
      } catch (error) {
        this.error = error.message || 'Failed to change task status';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
