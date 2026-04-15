<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import logo from '@/assets/img/logo.png';
import { useProjectStore } from '@/stores/projectStore';

const route = useRoute();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

const isActiveLink = (routePath) => {
  return route.path === routePath;
};

const currentProject = computed(() =>
  projects.value.find(
    (project) => String(project.id) === String(route.params.id ?? '')
  )
);

onMounted(() => {
  if (route.params.id && !projectStore.projects.length) {
    projectStore.fetchProjects().catch(() => {});
  }
});
</script>

<template>
  <nav class="bg-green-700 border-b border-green-500">
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="flex h-20 items-center justify-between">
        <div
          class="flex flex-1 items-center justify-center md:items-stretch md:justify-start"
        >
          <!-- Logo -->
          <RouterLink class="flex flex-shrink-0 items-center mr-4" to="/">
            <img class="h-10 w-auto" :src="logo" alt="Task Tracker logo" />
            <span class="hidden md:block text-white text-2xl font-bold ml-2"
              >Task Tracker</span
            >
          </RouterLink>
          <div class="md:ml-auto">
            <div class="flex space-x-2">
              <RouterLink
                to="/"
                :class="[
                  isActiveLink('/')
                    ? 'bg-green-900'
                    : 'hover:bg-gray-900 hover:text-white',
                  'text-white',
                  'px-3',
                  'py-2',
                  'rounded-md',
                ]"
                >Projects</RouterLink
              >
              <RouterLink
                to="/projects/add"
                :class="[
                  isActiveLink('/projects/add')
                    ? 'bg-green-900'
                    : 'hover:bg-gray-900 hover:text-white',
                  'text-white',
                  'px-3',
                  'py-2',
                  'rounded-md',
                ]"
                >New Project</RouterLink
              >
              <RouterLink
                to="/tasks/add"
                :class="[
                  isActiveLink('/tasks/add')
                    ? 'bg-green-900'
                    : 'hover:bg-gray-900 hover:text-white',
                  'text-white',
                  'px-3',
                  'py-2',
                  'rounded-md',
                ]"
                >New Task</RouterLink
              >
            </div>
          </div>
        </div>

        <div
          v-if="currentProject"
          class="hidden items-center gap-2 rounded-full bg-green-800/60 px-3 py-2 text-sm text-green-50 md:flex"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          Current project: {{ currentProject.name }}
        </div>
      </div>
    </div>
  </nav>
</template>
