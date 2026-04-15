<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import KanbanColumn from '@/components/KanbanColumn.vue';
import StatsBar from '@/components/StatsBar.vue';
import TaskDetailDrawer from '@/components/TaskDetailDrawer.vue';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

const route = useRoute();
const toast = useToast();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const taskState = storeToRefs(taskStore);
const projectState = storeToRefs(projectStore);
const taskError = taskState.error;
const taskLoading = taskState.isLoading;
const projectError = projectState.error;
const projectLoading = projectState.isLoading;
const projects = projectState.projects;

const searchQuery = ref('');
const selectedPriority = ref('all');
const currentView = ref('board');
const activeTaskId = ref(null);

const priorityOptions = [
  { label: 'All', value: 'all' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const viewOptions = [
  { label: 'Board', value: 'board', icon: 'pi pi-th-large' },
  { label: 'List', value: 'list', icon: 'pi pi-list' },
];

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const priorityLabels = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const boardColumns = [
  { status: 'todo', title: 'To Do', color: 'slate' },
  { status: 'in_progress', title: 'In Progress', color: 'orange' },
  { status: 'completed', title: 'Completed', color: 'green' },
  { status: 'cancelled', title: 'Cancelled', color: 'red' },
];

const currentProjectId = computed(() => String(route.params.id ?? ''));

const currentProject = computed(() =>
  projects.value.find(
    (project) => String(project.id) === String(currentProjectId.value)
  )
);

const currentProjectTasks = computed(() =>
  taskStore.tasks.filter(
    (task) => String(task.projectId) === String(currentProjectId.value)
  )
);

const pageLoading = computed(() => taskLoading.value || projectLoading.value);
const pageError = computed(() => taskError.value || projectError.value);

const filteredTasks = computed(() =>
  taskStore
    .filteredTasks(searchQuery.value, selectedPriority.value)
    .filter((task) => String(task.projectId) === String(currentProjectId.value))
);

const tasksByColumn = computed(() =>
  boardColumns.reduce((result, column) => {
    result[column.status] = filteredTasks.value.filter(
      (task) => task.status === column.status
    );
    return result;
  }, {})
);

const getColTasks = (status) => tasksByColumn.value[status] || [];

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

const getProgress = (task) => {
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];

  if (!subtasks.length) {
    return {
      done: 0,
      total: 0,
      pct: 0,
    };
  }

  const done = subtasks.filter((subtask) => subtask.done).length;

  return {
    done,
    total: subtasks.length,
    pct: Math.round((done / subtasks.length) * 100),
  };
};

const openTaskDetail = (taskId) => {
  activeTaskId.value = taskId;
};

const closeTaskDetail = () => {
  activeTaskId.value = null;
};

async function handleTaskMoved(taskId, newStatus) {
  try {
    const subtaskMsg = await taskStore.changeStatus(taskId, newStatus);
    toast.success(`Moved task to "${statusLabels[newStatus]}"`);

    if (subtaskMsg) {
      window.setTimeout(() => {
        toast.info(subtaskMsg);
      }, 400);
    }
  } catch (e) {
    toast.error('Failed to update the task status. Please try again.');
    await taskStore.fetchTasks();
  }
}

onMounted(() => {
  if (!taskStore.tasks.length) {
    taskStore.fetchTasks().catch(() => {});
  }

  if (!projectStore.projects.length) {
    projectStore.fetchProjects().catch(() => {});
  }
});
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_48%,_#f8fafc_100%)]">
    <div class="mx-auto max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header
        class="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur"
      >
        <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.32em] text-sky-600">
              Task Tracker
            </p>
            <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {{ currentProject?.name || 'Project Board' }}
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {{ currentProject?.description || 'Track status changes, owners, and due dates in one place so your team can stay focused on the work that matters most.' }}
            </p>
          </div>

          <RouterLink
            class="inline-flex items-center justify-center gap-2 self-start rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            :to="`/tasks/add?projectId=${currentProjectId}`"
          >
            <i class="pi pi-plus text-sm" />
            New Task
          </RouterLink>
        </div>

        <div class="mt-6">
          <StatsBar :tasks="currentProjectTasks" />
        </div>
      </header>

      <section
        class="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6"
      >
        <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex-1">
            <label class="relative block">
              <span class="sr-only">Search tasks</span>
              <i class="pi pi-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Search title, description, category, assignee, or tags"
                type="text"
              />
            </label>
          </div>

          <div class="flex flex-col gap-4 xl:items-end">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in priorityOptions"
                :key="option.value"
                :class="
                  selectedPriority === option.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                "
                class="rounded-full px-4 py-2 text-sm font-medium transition"
                type="button"
                @click="selectedPriority = option.value"
              >
                {{ option.label }}
              </button>
            </div>

            <div class="inline-flex rounded-full bg-slate-100 p-1">
              <button
                v-for="option in viewOptions"
                :key="option.value"
                :class="
                  currentView === option.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                "
                class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition"
                type="button"
                @click="currentView = option.value"
              >
                <i :class="option.icon" />
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>{{ filteredTasks.length }} result<span v-if="filteredTasks.length !== 1">s</span></span>
          <span class="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
          <span>
            Priority:
            {{ priorityOptions.find((option) => option.value === selectedPriority)?.label }}
          </span>
          <span v-if="searchQuery" class="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
          <span v-if="searchQuery">Keyword: "{{ searchQuery }}"</span>
        </div>
      </section>

      <section
        class="rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6"
      >
        <div
          v-if="pageLoading"
          class="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
        >
          Loading tasks...
        </div>

        <div
          v-else-if="!currentProject"
          class="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
        >
          The requested project was not found. Return to the projects page and choose another one.
        </div>

        <div
          v-else-if="currentView === 'board'"
          class="grid gap-5 xl:grid-cols-4"
        >
          <KanbanColumn
            v-for="column in boardColumns"
            :key="column.status"
            :color="column.color"
            :status="column.status"
            :tasks="getColTasks(column.status)"
            :title="column.title"
            @open-detail="openTaskDetail"
            @task-moved="handleTaskMoved"
          />
        </div>

        <div
          v-else
          class="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-left">
              <thead class="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th class="px-6 py-4 font-semibold">Title</th>
                  <th class="px-6 py-4 font-semibold">Status</th>
                  <th class="px-6 py-4 font-semibold">Priority</th>
                  <th class="px-6 py-4 font-semibold">Assignee</th>
                  <th class="px-6 py-4 font-semibold">Due Date</th>
                  <th class="px-6 py-4 font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="task in filteredTasks"
                  :key="task.id"
                  class="cursor-pointer transition hover:bg-slate-50"
                  @click="openTaskDetail(task.id)"
                >
                  <td class="px-6 py-4">
                    <div class="min-w-[16rem]">
                      <p class="font-medium text-slate-900">
                        {{ task.title }}
                      </p>
                      <p class="mt-1 text-sm text-slate-500">
                        {{ task.category || 'Uncategorized' }}
                      </p>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-700">
                    <span :class="['status-pill', `status-${task.status}`]">
                      {{ statusLabels[task.status] ?? task.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-700">
                    {{ priorityLabels[task.priority] ?? task.priority }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-700">
                    {{ task.assignee || 'Unassigned' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-700">
                    {{ formatDate(task.dueDate) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="w-40">
                      <div class="mb-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{{ getProgress(task).done }}/{{ getProgress(task).total }}</span>
                        <span>{{ getProgress(task).pct }}%</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          class="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                          :style="{ width: `${getProgress(task).pct}%` }"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredTasks.length">
                  <td class="px-6 py-12 text-center text-sm text-slate-500" colspan="6">
                    No tasks match the current filters
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p v-if="pageError" class="mt-4 text-sm text-red-600">
          {{ pageError }}
        </p>
      </section>
    </div>

    <TaskDetailDrawer
      :task-id="activeTaskId || ''"
      :show="Boolean(activeTaskId)"
      @close="closeTaskDetail"
    />
  </div>
</template>
