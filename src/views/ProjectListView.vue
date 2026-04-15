<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import ProjectCard from '@/components/ProjectCard.vue';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

const projectStore = useProjectStore();
const taskStore = useTaskStore();
const projectState = storeToRefs(projectStore);
const taskState = storeToRefs(taskStore);
const projects = projectState.projects;
const projectLoading = projectState.isLoading;
const projectError = projectState.error;
const taskLoading = taskState.isLoading;
const taskError = taskState.error;

const pageLoading = computed(() => projectLoading.value || taskLoading.value);
const pageError = computed(() => projectError.value || taskError.value);

const projectCards = computed(() =>
  projects.value.map((project) => {
    const tasks = taskStore.tasks.filter(
      (task) => String(task.projectId) === String(project.id)
    );
    const completedCount = tasks.filter(
      (task) => task.status === 'completed'
    ).length;

    return {
      ...project,
      taskCount: tasks.length,
      completedCount,
      progressPct:
        tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100),
    };
  })
);

onMounted(() => {
  if (!projectStore.projects.length) {
    projectStore.fetchProjects().catch(() => {});
  }

  if (!taskStore.tasks.length) {
    taskStore.fetchTasks().catch(() => {});
  }
});
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_100%)]">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.32em] text-sky-600">
              Task Tracker
            </p>
            <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Projects
            </h1>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Pick a project to open its kanban board, filter work, and track delivery progress.
            </p>
          </div>

          <RouterLink
            class="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            to="/projects/add"
          >
            <i class="pi pi-plus text-sm" />
            New Project
          </RouterLink>
        </div>
      </section>

      <section class="mt-8">
        <div
          v-if="pageLoading"
          class="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
        >
          Loading project data...
        </div>

        <div
          v-else-if="!projectCards.length"
          class="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
        >
          No projects yet. Create your first project to get started.
        </div>

        <div v-else class="grid gap-6 lg:grid-cols-2">
          <ProjectCard
            v-for="project in projectCards"
            :key="project.id"
            :completed-count="project.completedCount"
            :progress-pct="project.progressPct"
            :project="project"
            :task-count="project.taskCount"
          />
        </div>

        <p v-if="pageError" class="mt-4 text-sm text-red-600">
          {{ pageError }}
        </p>
      </section>
    </div>
  </div>
</template>
