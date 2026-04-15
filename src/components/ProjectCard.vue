<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  taskCount: {
    type: Number,
    default: 0,
  },
  completedCount: {
    type: Number,
    default: 0,
  },
  progressPct: {
    type: Number,
    default: 0,
  },
});

const formattedDate = computed(() => {
  if (!props.project.createdAt) {
    return 'Not recorded';
  }

  const date = new Date(`${props.project.createdAt}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return props.project.createdAt;
  }

  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
});
</script>

<template>
  <RouterLink
    :to="`/projects/${project.id}`"
    class="group block overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
  >
    <div class="h-2 w-full" :style="{ backgroundColor: project.color }" />

    <div class="p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h2 class="truncate text-xl font-semibold text-slate-900">
            {{ project.name }}
          </h2>
          <p class="mt-2 text-sm leading-7 text-slate-600">
            {{ project.description }}
          </p>
        </div>

        <span
          class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
          :style="{ backgroundColor: project.color }"
        >
          <i class="pi pi-folder text-base" />
        </span>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Task Count
          </p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">
            {{ taskCount }}
          </p>
        </div>

        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Created
          </p>
          <p class="mt-2 text-base font-semibold text-slate-900">
            {{ formattedDate }}
          </p>
        </div>
      </div>

      <div class="mt-6 rounded-2xl bg-slate-50 p-4">
        <div class="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
          <span>Project Progress</span>
          <span>{{ completedCount }}/{{ taskCount }} - {{ progressPct }}%</span>
        </div>

        <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full rounded-full transition-all duration-300"
            :style="{ width: `${progressPct}%`, backgroundColor: project.color }"
          />
        </div>
      </div>
    </div>
  </RouterLink>
</template>
