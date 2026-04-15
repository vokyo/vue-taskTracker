<script setup>
import { computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open-detail']);

const priorityStyles = {
  urgent: {
    label: 'Urgent',
    badge: 'badge-urgent',
  },
  high: {
    label: 'High',
    badge: 'badge-high',
  },
  medium: {
    label: 'Medium',
    badge: 'badge-medium',
  },
  low: {
    label: 'Low',
    badge: 'badge-low',
  },
};

const subtasks = computed(() =>
  Array.isArray(props.task.subtasks) ? props.task.subtasks : []
);

const doneSubtasks = computed(
  () => subtasks.value.filter((subtask) => subtask.done).length
);

const totalSubtasks = computed(() => subtasks.value.length);

const progressPct = computed(() => {
  if (totalSubtasks.value === 0) {
    return 0;
  }

  return Math.round((doneSubtasks.value / totalSubtasks.value) * 100);
});

const priorityMeta = computed(
  () => priorityStyles[props.task.priority] ?? priorityStyles.medium
);

const tags = computed(() => (Array.isArray(props.task.tags) ? props.task.tags : []));

const assigneeName = computed(() => props.task.assignee || 'Unassigned');

const assigneeInitial = computed(() => assigneeName.value.trim().slice(0, 1) || '?');

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) {
    return 'Not set';
  }

  const dueDate = new Date(`${props.task.dueDate}T00:00:00`);

  if (Number.isNaN(dueDate.getTime())) {
    return props.task.dueDate;
  }

  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dueDate);
});

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'completed') {
    return false;
  }

  const dueDate = new Date(`${props.task.dueDate}T00:00:00`);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  dueDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
});

const dueStatusDotClass = computed(() => {
  if (!props.task.dueDate) {
    return 'bg-slate-300';
  }

  if (isOverdue.value) {
    return 'bg-red-500';
  }

  const dueDate = new Date(`${props.task.dueDate}T00:00:00`);

  if (Number.isNaN(dueDate.getTime())) {
    return 'bg-slate-300';
  }

  dueDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate - today) / 86400000);

  if (diffDays <= 3) {
    return 'bg-yellow-400';
  }

  return 'bg-emerald-500';
});

const openDetail = () => {
  emit('open-detail', props.task.id);
};
</script>

<template>
  <article
    class="group task-card"
    role="button"
    tabindex="0"
    @click="openDetail"
    @keyup.enter="openDetail"
    @keyup.space.prevent="openDetail"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="truncate text-base font-semibold text-slate-900">
            {{ task.title }}
          </h3>
          <span
            :class="priorityMeta.badge"
            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
          >
            {{ priorityMeta.label }}
          </span>
        </div>

        <p
          class="mt-2 text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden"
        >
          {{ task.description }}
        </p>
      </div>

      <i
        class="pi pi-angle-right text-sm text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
      />
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="tag in tags"
        :key="tag"
        class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
      >
        {{ tag }}
      </span>

      <span
        v-if="!tags.length"
        class="inline-flex items-center rounded-full border border-dashed border-slate-200 px-2.5 py-1 text-xs text-slate-400"
      >
        No tags
      </span>
    </div>

    <div class="mt-5 rounded-2xl bg-slate-50 p-4">
      <div class="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
        <span>Subtask Progress</span>
        <span>{{ doneSubtasks }}/{{ totalSubtasks }} - {{ progressPct }}%</span>
      </div>

      <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
          :style="{ width: `${progressPct}%` }"
        />
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white"
        >
          {{ assigneeInitial }}
        </div>

        <div class="min-w-0">
          <p class="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
            Assignee
          </p>
          <p class="truncate text-sm font-medium text-slate-700">
            {{ assigneeName }}
          </p>
        </div>
      </div>

      <div class="text-right">
        <p class="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
          Due Date
        </p>
        <div class="inline-flex items-center justify-end gap-2">
          <span
            :class="dueStatusDotClass"
            class="h-2.5 w-2.5 rounded-full"
          />
          <p
            :class="isOverdue ? 'text-red-600' : 'text-slate-700'"
            class="text-sm font-medium"
          >
            {{ formattedDueDate }}
          </p>
        </div>
      </div>
    </div>
  </article>
</template>
