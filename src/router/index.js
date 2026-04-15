import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/ProjectListView.vue'),
      alias: ['/projects'],
    },
    {
      path: '/projects/add',
      name: 'add-project',
      component: () => import('@/views/AddProjectView.vue'),
    },
    {
      path: '/projects/:id',
      name: 'project-board',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/tasks/add',
      name: 'add-task',
      component: () => import('@/views/AddTaskView.vue'),
    },
    {
      path: '/tasks/:id',
      name: 'task-detail',
      component: () => import('@/views/TaskDetailView.vue'),
    },
    {
      path: '/tasks/:id/edit',
      name: 'edit-task',
      component: () => import('@/views/EditTaskView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
});

export default router;
