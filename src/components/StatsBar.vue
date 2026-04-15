<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTaskStore } from '@/stores/taskStore';

const props = defineProps({
  tasks: {
    type: Array,
    default: null,
  },
});

const taskStore = useTaskStore();
const { error, isLoading, taskStats } = storeToRefs(taskStore);

const resolvedStats = computed(() => {
  if (!Array.isArray(props.tasks)) {
    return taskStats.value;
  }

  const total = props.tasks.length;
  const inProgress = props.tasks.filter(
    (task) => task.status === 'in_progress'
  ).length;
  const completed = props.tasks.filter(
    (task) => task.status === 'completed'
  ).length;

  return {
    total,
    inProgress,
    completed,
    progressPct: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
});
</script>

<template>
  <section class="space-y-3">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-500">All Tasks</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">
              {{ resolvedStats.total }}
            </p>
          </div>

          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
          >
            <i class="pi pi-briefcase text-lg" />
          </span>
        </div>
      </article>

      <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-500">In Progress</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">
              {{ resolvedStats.inProgress }}
            </p>
          </div>

          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600"
          >
            <i class="pi pi-spin pi-spinner text-lg" />
          </span>
        </div>
      </article>

      <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-500">Completed</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">
              {{ resolvedStats.completed }}
            </p>
          </div>

          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"
          >
            <i class="pi pi-check-circle text-lg" />
          </span>
        </div>
      </article>

      <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-500">Overall Progress</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">
              {{ resolvedStats.progressPct }}%
            </p>
          </div>

          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"
          >
            <i class="pi pi-chart-line text-lg" />
          </span>
        </div>

        <div class="mt-4">
          <div class="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{{ resolvedStats.completed }}/{{ resolvedStats.total }} completed</span>
            <span v-if="isLoading">Syncing...</span>
          </div>

          <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all duration-300"
              :style="{ width: `${resolvedStats.progressPct}%` }"
            />
          </div>
        </div>
      </article>
    </div>

    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>
  </section>
</template>
