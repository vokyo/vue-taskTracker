<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from 'vue-toastification';
import ProjectForm from '@/components/ProjectForm.vue';
import { useProjectStore } from '@/stores/projectStore';

const router = useRouter();
const toast = useToast();
const projectStore = useProjectStore();
const { isLoading } = storeToRefs(projectStore);

const pageTitle = computed(() => 'New Project');

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const handleSubmit = async (formData) => {
  try {
    const createdProject = await projectStore.addProject({
      ...formData,
      id: uuidv4(),
      createdAt: getTodayString(),
    });

    toast.success('Project created successfully');
    router.push(`/projects/${createdProject.id}`);
  } catch {
    toast.error('Failed to create project');
  }
};
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.12),_transparent_26%),linear-gradient(180deg,_#f7fcf8_0%,_#f8fafc_100%)]">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div class="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <RouterLink
              class="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700"
              to="/"
            >
              <i class="pi pi-arrow-left text-xs" />
              Back to Projects
            </RouterLink>
            <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {{ pageTitle }}
            </h1>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Create a new project space for planning work, tracking progress, and organizing tasks.
            </p>
          </div>

          <span
            class="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
          >
            {{ isLoading ? 'Submitting...' : 'Project Setup' }}
          </span>
        </div>

        <div class="mt-8">
          <ProjectForm :is-edit="false" @submit="handleSubmit" />
        </div>
      </div>
    </div>
  </div>
</template>
