<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit']);

const createFormState = (source = {}) => ({
  id: source.id ?? '',
  name: source.name ?? '',
  description: source.description ?? '',
  color: source.color ?? '#2563EB',
  createdAt: source.createdAt ?? '',
});

const form = reactive(createFormState());

const resetForm = (source = {}) => {
  Object.assign(form, createFormState(source));
};

watch(
  () => props.initialData,
  (value) => {
    resetForm(value ?? {});
  },
  { immediate: true }
);

const handleSubmit = () => {
  emit('submit', {
    ...form,
    name: form.name.trim(),
    description: form.description.trim(),
    color: form.color || '#2563EB',
  });
};
</script>

<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <section class="grid gap-6">
      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Project Name</span>
        <input
          v-model="form.name"
          required
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          placeholder="Example: Marketing Website Refresh"
          type="text"
        />
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Project Description</span>
        <textarea
          v-model="form.description"
          class="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          placeholder="Add the project goal, scope, and key milestones"
        />
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-slate-700">Theme Color</span>
        <div class="mt-2 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            v-model="form.color"
            class="h-12 w-16 cursor-pointer rounded-xl border-0 bg-transparent p-0"
            type="color"
          />
          <span class="text-sm font-medium text-slate-600">
            {{ form.color }}
          </span>
        </div>
      </label>
    </section>

    <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
      <button
        class="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        type="submit"
      >
        {{ isEdit ? 'Save Project' : 'Create Project' }}
      </button>
    </div>
  </form>
</template>
