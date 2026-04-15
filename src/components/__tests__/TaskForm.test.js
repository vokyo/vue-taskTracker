// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskForm from '@/components/TaskForm.vue';

const findButtonByText = (wrapper, text) =>
  wrapper.findAll('button').find((button) => button.text().trim() === text);

describe('TaskForm', () => {
  it('emits a normalized task payload on submit', async () => {
    const wrapper = mount(TaskForm, {
      props: {
        initialData: {
          comments: [
            {
              author: 'Priya',
              content: 'Keep the existing comment',
              time: '2026-04-02',
            },
          ],
        },
        projects: [
          { id: 'proj-001', name: 'Alpha' },
          { id: 'proj-002', name: 'Beta' },
        ],
      },
    });

    await wrapper.find('select[required]').setValue('proj-002');
    await wrapper
      .find('input[placeholder="Example: Build the task board landing page"]')
      .setValue('  Launch board polish  ');
    await wrapper
      .find('textarea[placeholder="Add the background, goal, and acceptance criteria"]')
      .setValue('  Finalize the filters and empty states.  ');
    await wrapper.find('input[placeholder="Example: Alex Chen"]').setValue('  Jamie Doe  ');
    await wrapper.find('input[type="date"]').setValue('2026-04-30');

    const addTagButton = findButtonByText(wrapper, 'Add Tag');
    const addSubtaskButton = findButtonByText(wrapper, 'Add Subtask');

    await wrapper
      .find('input[placeholder="Example: frontend, API integration"]')
      .setValue('  frontend  ');
    await addTagButton.trigger('click');

    await addSubtaskButton.trigger('click');
    await wrapper
      .find('input[placeholder="Example: Confirm API field mapping"]')
      .setValue('  Confirm API contract  ');

    await addSubtaskButton.trigger('click');
    await wrapper.find('form').trigger('submit.prevent');

    const submitEvents = wrapper.emitted('submit');
    expect(submitEvents).toHaveLength(1);

    const [payload] = submitEvents[0];
    expect(payload).toEqual({
      id: '',
      projectId: 'proj-002',
      title: 'Launch board polish',
      description: 'Finalize the filters and empty states.',
      status: 'todo',
      priority: 'medium',
      category: 'Planning',
      assignee: 'Jamie Doe',
      dueDate: '2026-04-30',
      tags: ['frontend'],
      subtasks: [
        {
          title: 'Confirm API contract',
          done: false,
        },
      ],
      comments: [
        {
          author: 'Priya',
          content: 'Keep the existing comment',
          time: '2026-04-02',
        },
      ],
    });
  });
});
