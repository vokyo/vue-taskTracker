// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

const push = vi.fn();
const toast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');

  return {
    ...actual,
    useRouter: () => ({
      push,
    }),
  };
});

vi.mock('vue-toastification', () => ({
  useToast: () => toast,
}));

import TaskDetailDrawer from '@/components/TaskDetailDrawer.vue';
import { useTaskStore } from '@/stores/taskStore';

const findButtonByText = (wrapper, text) =>
  wrapper.findAll('button').find((button) => button.text().trim() === text);

describe('TaskDetailDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
    toast.info.mockReset();

    const taskStore = useTaskStore();
    taskStore.tasks = [
      {
        id: 'task-123',
        projectId: 'proj-001',
        title: 'Improve task detail navigation',
        description: 'Make edit navigation stable from every entry point.',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-04-30',
        subtasks: [],
        comments: [],
      },
    ];
  });

  it('navigates to the edit page without emitting close first', async () => {
    const wrapper = mount(TaskDetailDrawer, {
      props: {
        show: true,
        taskId: 'task-123',
      },
      global: {
        stubs: {
          Transition: false,
        },
      },
    });

    await findButtonByText(wrapper, 'Edit').trigger('click');

    expect(push).toHaveBeenCalledWith('/tasks/task-123/edit');
    expect(wrapper.emitted('close')).toBeUndefined();
  });
});
