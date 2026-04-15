<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import TaskCard from './TaskCard.vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'slate',
  },
  tasks: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['open-detail', 'task-moved']);
const useFallbackDrag = ref(false);

const colorStyles = {
  slate: {
    header: 'bg-slate-900 text-white',
    badge: 'bg-white/15 text-white',
    dot: 'bg-slate-300',
    empty: 'border-slate-200 bg-slate-50 text-slate-500',
  },
  red: {
    header: 'bg-red-600 text-white',
    badge: 'bg-white/15 text-white',
    dot: 'bg-red-200',
    empty: 'border-red-200 bg-red-50 text-red-500',
  },
  orange: {
    header: 'bg-orange-500 text-white',
    badge: 'bg-white/15 text-white',
    dot: 'bg-orange-200',
    empty: 'border-orange-200 bg-orange-50 text-orange-600',
  },
  yellow: {
    header: 'bg-yellow-400 text-slate-900',
    badge: 'bg-white/60 text-slate-700',
    dot: 'bg-yellow-100',
    empty: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  },
  green: {
    header: 'bg-emerald-500 text-white',
    badge: 'bg-white/15 text-white',
    dot: 'bg-emerald-200',
    empty: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  blue: {
    header: 'bg-sky-500 text-white',
    badge: 'bg-white/15 text-white',
    dot: 'bg-sky-200',
    empty: 'border-sky-200 bg-sky-50 text-sky-600',
  },
  purple: {
    header: 'bg-violet-500 text-white',
    badge: 'bg-white/15 text-white',
    dot: 'bg-violet-200',
    empty: 'border-violet-200 bg-violet-50 text-violet-600',
  },
};

const colorMeta = computed(
  () => colorStyles[props.color.toLowerCase()] ?? colorStyles.slate
);

const normalizedTasks = computed(() =>
  Array.isArray(props.tasks) ? props.tasks : []
);

const localTasks = ref([...normalizedTasks.value]);

watch(
  normalizedTasks,
  (tasks) => {
    localTasks.value = [...tasks];
  },
  { immediate: true }
);

onMounted(() => {
  const hasCoarsePointer =
    window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const hasTouchPoints = navigator.maxTouchPoints > 0;

  useFallbackDrag.value = hasCoarsePointer || hasTouchPoints;
});

const handleOpenDetail = (taskId) => {
  emit('open-detail', taskId);
};

const onDragEnd = (evt) => {
  if (evt.from === evt.to) {
    return;
  }

  const taskId = evt.item?.dataset?.id || localTasks.value[evt.newIndex]?.id;
  const nextStatus =
    evt.to?.closest('[data-status]')?.dataset?.status || props.status;

  if (!taskId || !nextStatus) {
    return;
  }

  emit('task-moved', taskId, nextStatus);
};
</script>

<template>
  <section
    :data-status="status"
    class="kanban-col"
  >
    <header
      :class="colorMeta.header"
      class="flex items-center justify-between rounded-t-[28px] px-5 py-4"
    >
      <div class="flex items-center gap-3">
        <span :class="colorMeta.dot" class="h-2.5 w-2.5 rounded-full" />
        <h2 class="text-sm font-semibold tracking-wide">
          {{ title }}
        </h2>
      </div>

      <span
        :class="colorMeta.badge"
        class="inline-flex min-w-9 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold"
      >
        {{ tasks.length }}
      </span>
    </header>

    <div class="flex h-full flex-1 flex-col p-4">
      <draggable
        :list="localTasks"
        :animation="180"
        :empty-insert-threshold="28"
        :fallback-on-body="useFallbackDrag"
        :fallback-tolerance="10"
        :force-fallback="useFallbackDrag"
        :touch-start-threshold="5"
        chosen-class="drag-chosen"
        class="task-list flex min-h-[14rem] flex-1 flex-col gap-4"
        drag-class="drag-dragging"
        :delay-on-touch-only="true"
        ghost-class="drag-ghost"
        group="tasks"
        item-key="id"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div :data-id="element.id">
            <TaskCard :task="element" @open-detail="handleOpenDetail" />
          </div>
        </template>

        <template #footer>
          <div
            v-if="!localTasks.length"
            :class="colorMeta.empty"
            class="flex min-h-[14rem] flex-1 items-center justify-center rounded-3xl border border-dashed px-4 text-center text-sm"
          >
            No tasks yet
          </div>
        </template>
      </draggable>
    </div>
  </section>
</template>
