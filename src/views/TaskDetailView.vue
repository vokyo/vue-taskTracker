<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import TaskDetailDrawer from '@/components/TaskDetailDrawer.vue';
import { useTaskStore } from '@/stores/taskStore';

const route = useRoute();
const router = useRouter();
const taskStore = useTaskStore();
const { error, isLoading, tasks } = storeToRefs(taskStore);

const taskId = computed(() => String(route.params.id ?? ''));
const task = computed(() =>
  tasks.value.find((item) => String(item.id) === taskId.value)
);

const boardPath = computed(() =>
  task.value?.projectId ? `/projects/${task.value.projectId}` : '/'
);

const closeDrawer = () => {
  router.push(boardPath.value);
};

onMounted(() => {
  if (!task.value && !isLoading.value) {
    taskStore.fetchTasks().catch(() => {});
  }
});
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_48%,_#f8fafc_100%)]">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <RouterLink
          class="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700"
          :to="boardPath"
        >
          <i class="pi pi-arrow-left text-xs" />
          Back to Board
        </RouterLink>

        <div class="mt-6">
          <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
            {{ task?.title || 'Task Details' }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Review the latest task status, ownership, due date, subtasks, and comments from one focused view.
          </p>
        </div>

        <div v-if="isLoading" class="mt-10 text-sm text-slate-500">
          Loading task data...
        </div>
        <div v-else-if="error" class="mt-10 text-sm text-red-600">
          {{ error }}
        </div>
      </div>
    </div>

    <TaskDetailDrawer :show="true" :task-id="taskId" @close="closeDrawer" />
  </div>
</template>
