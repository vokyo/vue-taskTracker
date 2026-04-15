// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

const routeState = {
  params: {
    id: 'proj-001',
  },
};

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');

  return {
    ...actual,
    useRoute: () => routeState,
  };
});

vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

import HomeView from '@/views/HomeView.vue';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

const findButtonByText = (wrapper, text) =>
  wrapper.findAll('button').find((button) => button.text().trim() === text);

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    const projectStore = useProjectStore();
    const taskStore = useTaskStore();

    projectStore.projects = [
      {
        id: 'proj-001',
        name: 'Product Launch',
        description: 'Ship the next release',
      },
      {
        id: 'proj-002',
        name: 'Marketing Refresh',
        description: 'Refresh the site',
      },
    ];

    taskStore.tasks = [
      {
        id: 'task-1',
        projectId: 'proj-001',
        title: 'Launch landing page',
        description: 'Finalize the frontend handoff',
        status: 'todo',
        priority: 'high',
        category: 'Development',
        assignee: 'Alex',
        tags: ['frontend'],
        dueDate: '2026-04-25',
        subtasks: [],
      },
      {
        id: 'task-2',
        projectId: 'proj-001',
        title: 'API cleanup',
        description: 'Stabilize the API before launch',
        status: 'in_progress',
        priority: 'medium',
        category: 'Development',
        assignee: 'Priya',
        tags: ['backend'],
        dueDate: '2026-04-26',
        subtasks: [],
      },
      {
        id: 'task-3',
        projectId: 'proj-002',
        title: 'Frontend content pass',
        description: 'Audit the site copy',
        status: 'todo',
        priority: 'high',
        category: 'Testing',
        assignee: 'Sam',
        tags: ['frontend'],
        dueDate: '2026-04-27',
        subtasks: [],
      },
    ];
  });

  it('scopes filters to the active project and updates the list view', async () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
          KanbanColumn: {
            props: ['title', 'tasks'],
            template: '<div class="kanban-column-stub">{{ title }}:{{ tasks.length }}</div>',
          },
          StatsBar: {
            template: '<div class="stats-bar-stub" />',
          },
          TaskDetailDrawer: {
            template: '<div class="task-detail-drawer-stub" />',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('2 results');
    expect(wrapper.text()).toContain('Product Launch');

    await wrapper
      .find('input[placeholder="Search title, description, category, assignee, or tags"]')
      .setValue('frontend');
    await findButtonByText(wrapper, 'List').trigger('click');

    expect(wrapper.text()).toContain('1 result');
    expect(wrapper.text()).toContain('Launch landing page');
    expect(wrapper.text()).not.toContain('API cleanup');
    expect(wrapper.text()).not.toContain('Frontend content pass');
  });
});
