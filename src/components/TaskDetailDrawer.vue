<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useTaskStore } from '@/stores/taskStore';

const props = defineProps({
  taskId: {
    type: String,
    default: '',
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'status-changed']);

const router = useRouter();
const toast = useToast();
const taskStore = useTaskStore();
const { isLoading, tasks } = storeToRefs(taskStore);

const newComment = ref('');

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusStyles = {
  todo: 'bg-status-todo/10 text-status-todo',
  in_progress: 'bg-status-in_progress/10 text-status-in_progress',
  completed: 'bg-status-completed/10 text-status-completed',
  cancelled: 'bg-status-cancelled/10 text-status-cancelled',
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const priorityStyles = {
  urgent: 'badge-urgent',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const priorityLabels = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const task = computed(() =>
  tasks.value.find((item) => String(item.id) === String(props.taskId))
);

const subtasks = computed(() =>
  Array.isArray(task.value?.subtasks) ? task.value.subtasks : []
);

const comments = computed(() =>
  Array.isArray(task.value?.comments) ? task.value.comments : []
);

const progress = computed(() => {
  if (!subtasks.value.length) {
    return {
      done: 0,
      total: 0,
      pct: 0,
    };
  }

  const done = subtasks.value.filter((subtask) => subtask.done).length;

  return {
    done,
    total: subtasks.value.length,
    pct: Math.round((done / subtasks.value.length) * 100),
  };
});

const currentStatus = computed(() => task.value?.status || 'todo');

const formatDate = (dateString) => {
  if (!dateString) {
    return 'Not set';
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const closeDrawer = () => {
  emit('close');
};

const ensureTaskLoaded = async () => {
  if (!props.show || task.value || isLoading.value) {
    return;
  }

  try {
    await taskStore.fetchTasks();
  } catch {
    return;
  }
};

watch(
  () => [props.show, props.taskId],
  () => {
    ensureTaskLoaded();

    if (!props.show) {
      newComment.value = '';
    }
  },
  { immediate: true }
);

const handleEdit = () => {
  if (!task.value) {
    return;
  }

  router.push(`/tasks/${task.value.id}/edit`);
};

const handleDelete = async () => {
  if (!task.value) {
    return;
  }

  const confirmed = window.confirm(`Delete task "${task.value.title}"?`);

  if (!confirmed) {
    return;
  }

  try {
    await taskStore.removeTask(task.value.id);
    toast.success('Task deleted');
    closeDrawer();
  } catch {
    toast.error('Failed to delete task');
  }
};

const handleStatusChange = async (event) => {
  if (!task.value) {
    return;
  }

  const newStatus = event.target.value;

  if (newStatus === task.value.status) {
    return;
  }

  try {
    await taskStore.changeStatus(task.value.id, newStatus);
    toast.success('Task status updated');
    emit('status-changed', {
      id: task.value.id,
      status: newStatus,
    });
  } catch {
    toast.error('Failed to update task status');
  }
};

const toggleSubtask = async (index) => {
  if (!task.value) {
    return;
  }

  const updatedTask = {
    ...task.value,
    subtasks: subtasks.value.map((subtask, subtaskIndex) =>
      subtaskIndex === index ? { ...subtask, done: !subtask.done } : subtask
    ),
  };

  try {
    await taskStore.updateTask(task.value.id, updatedTask);
    toast.success('Subtask progress updated');
  } catch {
    toast.error('Failed to update subtask');
  }
};

const addComment = async () => {
  if (!task.value) {
    return;
  }

  const content = newComment.value.trim();

  if (!content) {
    return;
  }

  const updatedTask = {
    ...task.value,
    comments: [
      ...comments.value,
      {
        author: 'Me',
        content,
        time: getTodayString(),
      },
    ],
  };

  try {
    await taskStore.updateTask(task.value.id, updatedTask);
    newComment.value = '';
    toast.success('Comment added');
  } catch {
    toast.error('Failed to add comment');
  }
};
</script>

<template>
  <Transition name="slide">
    <div v-if="show" class="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close task details"
        class="task-drawer-overlay absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        type="button"
        @click="closeDrawer"
      />

      <aside
        class="task-drawer-panel relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
      >
        <div class="border-b border-slate-100 px-6 py-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                Task Detail
              </p>
              <h2 class="mt-2 truncate text-2xl font-semibold text-slate-900">
                {{ task?.title || 'Task Details' }}
              </h2>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                type="button"
                @click="handleEdit"
              >
                <i class="pi pi-pencil text-xs" />
                Edit
              </button>

              <button
                class="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                type="button"
                @click="handleDelete"
              >
                <i class="pi pi-trash text-xs" />
                Delete
              </button>

              <button
                class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                type="button"
                @click="closeDrawer"
              >
                <i class="pi pi-times" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="task" class="flex-1 space-y-6 px-6 py-6">
          <section class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Status
              </p>
              <select
                :value="currentStatus"
                class="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                @change="handleStatusChange"
              >
                <option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Priority
              </p>
              <div class="mt-3">
                <span
                  :class="priorityStyles[task.priority] ?? 'bg-slate-100 text-slate-700'"
                  class="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
                >
                  {{ priorityLabels[task.priority] ?? task.priority }}
                </span>
              </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Assignee
              </p>
              <p class="mt-3 text-base font-semibold text-slate-800">
                {{ task.assignee || 'Unassigned' }}
              </p>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Due Date
              </p>
              <p class="mt-3 text-base font-semibold text-slate-800">
                {{ formatDate(task.dueDate) }}
              </p>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Category
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <span
                  :class="statusStyles[task.status] ?? 'bg-slate-100 text-slate-700'"
                  class="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
                >
                  {{ statusLabels[task.status] ?? task.status }}
                </span>
                <span class="text-base font-semibold text-slate-800">
                  {{ task.category || 'Uncategorized' }}
                </span>
              </div>
            </div>
          </section>

          <section class="rounded-[28px] border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-slate-800">Description</h3>
            <p class="mt-3 text-sm leading-7 text-slate-600">
              {{ task.description || 'No description yet' }}
            </p>
          </section>

          <section class="rounded-[28px] border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-slate-800">Tags</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="tag in task.tags || []"
                :key="tag"
                class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {{ tag }}
              </span>
              <span
                v-if="!(task.tags || []).length"
                class="text-sm text-slate-400"
              >
                No tags yet
              </span>
            </div>
          </section>

          <section class="rounded-[28px] border border-slate-200 bg-white p-5">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-semibold text-slate-800">Subtasks</h3>
              <span class="text-sm font-medium text-slate-500">
                {{ progress.done }}/{{ progress.total }} - {{ progress.pct }}%
              </span>
            </div>

            <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                :style="{ width: `${progress.pct}%` }"
              />
            </div>

            <ul v-if="subtasks.length" class="mt-4 space-y-3">
              <li
                v-for="(subtask, index) in subtasks"
                :key="`${subtask.title}-${index}`"
                class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <input
                  :checked="subtask.done"
                  class="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  type="checkbox"
                  @change="toggleSubtask(index)"
                />
                <span
                  :class="subtask.done ? 'text-slate-400 line-through' : 'text-slate-700'"
                  class="text-sm"
                >
                  {{ subtask.title }}
                </span>
              </li>
            </ul>

            <p v-else class="mt-4 text-sm text-slate-400">
              No subtasks yet
            </p>
          </section>

          <section class="rounded-[28px] border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-slate-800">Comments</h3>

            <div v-if="comments.length" class="mt-4 space-y-3">
              <article
                v-for="comment in comments"
                :key="`${comment.author}-${comment.time}-${comment.content}`"
                class="rounded-3xl bg-slate-50 p-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-slate-800">
                    {{ comment.author }}
                  </p>
                  <p class="text-xs text-slate-400">
                    {{ formatDate(comment.time) }}
                  </p>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{ comment.content }}
                </p>
              </article>
            </div>

            <p v-else class="mt-4 text-sm text-slate-400">
              No comments yet
            </p>

            <form
              class="mt-5 flex items-center gap-3"
              @submit.prevent="addComment"
            >
              <input
                v-model="newComment"
                class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Write a new comment..."
                type="text"
              />
              <button
                class="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                :disabled="!newComment.trim()"
                type="submit"
              >
                <i class="pi pi-send text-xs" />
                Send
              </button>
            </form>
          </section>
        </div>

        <div
          v-else
          class="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-500"
        >
          The selected task could not be found. Return to the board and choose another task.
        </div>
      </aside>
    </div>
  </Transition>
</template>
