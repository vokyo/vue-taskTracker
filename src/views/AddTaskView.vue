<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from 'vue-toastification';
import TaskForm from '@/components/TaskForm.vue';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const taskState = storeToRefs(taskStore);
const projectState = storeToRefs(projectStore);
const isLoading = taskState.isLoading;
const projects = projectState.projects;

const pageTitle = computed(() => 'New Task');

const selectedProjectId = computed(() => {
  const routeProjectId = String(route.query.projectId ?? '');
  const hasRouteProject = projects.value.some(
    (project) => String(project.id) === routeProjectId
  );

  if (hasRouteProject) {
    return routeProjectId;
  }

  return projects.value[0]?.id ?? '';
});

const selectedProject = computed(() =>
  projects.value.find(
    (project) => String(project.id) === String(selectedProjectId.value)
  )
);

const backTarget = computed(() =>
  selectedProjectId.value ? `/projects/${selectedProjectId.value}` : '/'
);

const initialTaskData = computed(() => ({
  projectId: selectedProjectId.value,
}));

const handleSubmit = async (formData) => {
  try {
    const createdTask = await taskStore.addTask({
      ...formData,
      id: uuidv4(),
      comments: Array.isArray(formData.comments) ? formData.comments : [],
    });

    toast.success('Task created successfully');
    router.push(`/projects/${createdTask.projectId}`);
  } catch {
    toast.error('Failed to create task');
  }
};

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
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#f1f5f9_100%)]">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div class="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <RouterLink
              class="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700"
              :to="backTarget"
            >
              <i class="pi pi-arrow-left text-xs" />
              {{ selectedProject ? 'Back to Board' : 'Back to Projects' }}
            </RouterLink>
            <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {{ pageTitle }}
            </h1>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Create a new task and capture the project, tags, owner, and subtasks that support it.
            </p>
          </div>

          <span
            class="inline-flex items-center rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700"
          >
            {{ isLoading ? 'Submitting...' : 'Task Tracker' }}
          </span>
        </div>

        <div
          v-if="!projects.length"
          class="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center"
        >
          <p class="text-sm text-slate-500">
            There are no projects available yet. Create a project first.
          </p>
          <RouterLink
            class="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            to="/projects/add"
          >
            New Project
          </RouterLink>
        </div>

        <div v-else class="mt-8">
          <TaskForm
            :initial-data="initialTaskData"
            :is-edit="false"
            :projects="projects"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
