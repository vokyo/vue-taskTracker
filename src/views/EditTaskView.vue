<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import TaskForm from '@/components/TaskForm.vue';
import { getTaskById } from '@/api/tasks';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const { isLoading } = storeToRefs(taskStore);
const { projects } = storeToRefs(projectStore);

const taskId = String(route.params.id ?? '');
const initialData = ref(null);
const pageLoading = ref(true);
const loadError = ref('');

const upsertTask = (task) => {
  const index = taskStore.tasks.findIndex(
    (item) => String(item.id) === String(task.id)
  );

  if (index === -1) {
    taskStore.tasks.push(task);
  } else {
    taskStore.tasks.splice(index, 1, task);
  }
};

const loadTask = async () => {
  pageLoading.value = true;
  loadError.value = '';

  try {
    const task = await getTaskById(taskId);
    initialData.value = task;
    upsertTask(task);
  } catch (error) {
    loadError.value = error.message || 'Failed to load task';
    toast.error('Failed to load task');
  } finally {
    pageLoading.value = false;
  }
};

const handleSubmit = async (formData) => {
  try {
    await taskStore.updateTask(taskId, {
      ...initialData.value,
      ...formData,
      id: taskId,
    });

    toast.success('Task updated successfully');
    router.push(`/tasks/${taskId}`);
  } catch {
    toast.error('Failed to update task');
  }
};

onMounted(() => {
  if (!projectStore.projects.length) {
    projectStore.fetchProjects().catch(() => {});
  }

  loadTask();
});
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.10),_transparent_24%),linear-gradient(180deg,_#fffaf5_0%,_#f8fafc_100%)]">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div class="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <RouterLink
              class="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700"
              :to="`/tasks/${taskId}`"
            >
              <i class="pi pi-arrow-left text-xs" />
              Back to Task Details
            </RouterLink>
            <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Edit Task
            </h1>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Update the task status, category, due date, and subtask breakdown.
            </p>
          </div>

          <span
            class="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700"
          >
            {{ isLoading ? 'Saving...' : 'Task Editor' }}
          </span>
        </div>

        <div v-if="pageLoading" class="py-20 text-center text-sm text-slate-500">
          Loading task details...
        </div>

        <div v-else-if="loadError" class="py-20 text-center">
          <p class="text-sm text-red-600">{{ loadError }}</p>
          <RouterLink
            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700"
            to="/"
          >
            Back to Board
          </RouterLink>
        </div>

        <div v-else class="mt-8">
          <TaskForm
            :initial-data="initialData"
            :is-edit="true"
            :projects="projects"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
