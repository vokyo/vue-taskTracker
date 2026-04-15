<script setup>
import { reactive, ref, watch } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  projects: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['submit']);

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

const categoryOptions = ['Planning', 'Design', 'Development', 'Testing', 'Operations'];

const createFormState = (source = {}) => ({
  id: source.id ?? '',
  projectId: source.projectId ?? '',
  title: source.title ?? '',
  description: source.description ?? '',
  status: source.status ?? 'todo',
  priority: source.priority ?? 'medium',
  category: source.category ?? 'Planning',
  assignee: source.assignee ?? '',
  dueDate: source.dueDate ?? '',
  tags: Array.isArray(source.tags)
    ? source.tags.map((tag) => String(tag)).filter(Boolean)
    : [],
  subtasks: Array.isArray(source.subtasks)
    ? source.subtasks.map((subtask) => ({
        title: subtask?.title ?? '',
        done: Boolean(subtask?.done),
      }))
    : [],
  comments: Array.isArray(source.comments)
    ? source.comments.map((comment) => ({ ...comment }))
    : [],
});

const form = reactive(createFormState());
const tagInput = ref('');

const resetForm = (source = {}) => {
  Object.assign(form, createFormState(source));
  tagInput.value = '';
};

watch(
  () => props.initialData,
  (value) => {
    resetForm(value ?? {});
  },
  { immediate: true }
);

const addTag = () => {
  const value = tagInput.value.trim();

  if (!value || form.tags.includes(value)) {
    tagInput.value = '';
    return;
  }

  form.tags.push(value);
  tagInput.value = '';
};

const removeTag = (index) => {
  form.tags.splice(index, 1);
};

const addSubtask = () => {
  form.subtasks.push({
    title: '',
    done: false,
  });
};

const removeSubtask = (index) => {
  form.subtasks.splice(index, 1);
};

const handleSubmit = () => {
  const payload = {
    ...form,
    title: form.title.trim(),
    projectId: form.projectId || '',
    description: form.description.trim(),
    assignee: form.assignee.trim(),
    dueDate: form.dueDate || '',
    tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
    subtasks: form.subtasks
      .map((subtask) => ({
        title: subtask.title.trim(),
        done: Boolean(subtask.done),
      }))
      .filter((subtask) => subtask.title),
    comments: Array.isArray(form.comments)
      ? form.comments.map((comment) => ({ ...comment }))
      : [],
  };

  emit('submit', payload);
};
</script>

<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <section class="grid gap-6 lg:grid-cols-2">
      <label class="block lg:col-span-2">
        <span class="text-sm font-semibold text-slate-700">Project</span>
        <select
          v-model="form.projectId"
          required
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        >
          <option disabled value="">
            Select a project
          </option>
          <option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </label>

      <div class="lg:col-span-2">
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">Task Title</span>
          <input
            v-model="form.title"
            required
            class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Example: Build the task board landing page"
            type="text"
          />
        </label>
      </div>

      <div class="lg:col-span-2">
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">Task Description</span>
          <textarea
            v-model="form.description"
            class="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Add the background, goal, and acceptance criteria"
          />
        </label>
      </div>

      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Status</span>
        <select
          v-model="form.status"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        >
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Priority</span>
        <select
          v-model="form.priority"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        >
          <option
            v-for="option in priorityOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Category</span>
        <select
          v-model="form.category"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        >
          <option
            v-for="category in categoryOptions"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Assignee</span>
        <input
          v-model="form.assignee"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          placeholder="Example: Alex Chen"
          type="text"
        />
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Due Date</span>
        <input
          v-model="form.dueDate"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          type="date"
        />
      </label>
    </section>

    <section class="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-sm font-semibold text-slate-800">Tags</h2>
          <p class="mt-1 text-sm text-slate-500">Press Enter or click add after typing</p>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          v-model="tagInput"
          class="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          placeholder="Example: frontend, API integration"
          type="text"
          @keydown.enter.prevent="addTag"
        />
        <button
          class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          type="button"
          @click="addTag"
        >
          Add Tag
        </button>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="(tag, index) in form.tags"
          :key="`${tag}-${index}`"
          class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
        >
          {{ tag }}
          <button
            class="text-slate-400 transition hover:text-red-500"
            type="button"
            @click="removeTag(index)"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </span>
        <span v-if="!form.tags.length" class="text-sm text-slate-400">
          No tags yet
        </span>
      </div>
    </section>

    <section class="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-sm font-semibold text-slate-800">Subtasks</h2>
          <p class="mt-1 text-sm text-slate-500">Break the task into smaller action items</p>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
          type="button"
          @click="addSubtask"
        >
          <i class="pi pi-plus text-xs" />
          Add Subtask
        </button>
      </div>

      <div v-if="form.subtasks.length" class="mt-4 space-y-3">
        <div
          v-for="(subtask, index) in form.subtasks"
          :key="index"
          class="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto_auto]"
        >
          <input
            v-model="subtask.title"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Example: Confirm API field mapping"
            type="text"
          />

          <label class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input
              v-model="subtask.done"
              class="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
              type="checkbox"
            />
            Done
          </label>

          <button
            class="inline-flex items-center justify-center rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            type="button"
            @click="removeSubtask(index)"
          >
            Delete
          </button>
        </div>
      </div>

      <p v-else class="mt-4 text-sm text-slate-400">
        No subtasks yet. Use the button above to add one.
      </p>
    </section>

    <div class="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
      <button
        class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        type="submit"
      >
        {{ isEdit ? 'Save Changes' : 'Create Task' }}
      </button>
    </div>
  </form>
</template>
