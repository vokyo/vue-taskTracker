# Vue 3 vs React: A Side-by-Side Comparison

This project is built in Vue 3, but many of its patterns map cleanly to React. If you already know React, the fastest way to learn Vue is to line up familiar ideas and notice where Vue removes boilerplate.

## 1. Component Definition

**Vue 3 (`<script setup>`)**

```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value += 1;
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

**React**

```jsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}
```

Vue separates component logic from markup, while React keeps both in JSX. `ref()` is similar to `useState()`, but in Vue you update `count.value` in script and use `count` directly in the template. Events also read a little cleaner in Vue: `@click` instead of `onClick`.

## 2. State Management

**Local state: `ref` / `reactive` vs `useState`**

```vue
const tagInput = ref('');
const form = reactive({ title: '', priority: 'medium' });
form.title = 'Build board';
tagInput.value = 'frontend';
```

```jsx
const [tagInput, setTagInput] = useState('');
const [form, setForm] = useState({ title: '', priority: 'medium' });
setForm((prev) => ({ ...prev, title: 'Build board' }));
setTagInput('frontend');
```

Vue gives you mutable-looking reactive objects. React keeps updates explicit through setters, which is noisier but makes state transitions very visible.

**Pinia in this project vs an equivalent Zustand store**

```js
// Vue: src/stores/taskStore.js
export const useTaskStore = defineStore('taskStore', {
  state: () => ({ tasks: [], isLoading: false, error: null }),
  getters: {
    filteredTasks: (state) => (search = '', priority = '') =>
      state.tasks.filter((task) => matches(task, search, priority)),
  },
  actions: {
    async fetchTasks() { this.tasks = await getAllTasks(); },
    async addTask(task) { this.tasks.push(await createTaskApi(task)); },
  },
});
```

```js
// React: equivalent Zustand version
export const useTaskStore = create((set, get) => ({
  tasks: [], isLoading: false, error: null,
  filteredTasks: (search = '', priority = '') =>
    get().tasks.filter((task) => matches(task, search, priority)),
  fetchTasks: async () => set({ tasks: await getAllTasks() }),
  addTask: async (task) =>
    set((state) => ({ tasks: [...state.tasks, await createTaskApi(task)] })),
}));
```

Pinia feels like Vue components scaled up: `state`, `getters`, and `actions`. Zustand is lighter and hook-based, but you usually think in `set/get` instead of `this`. If you come from Redux Toolkit, Pinia will likely feel simpler than slices and reducers for a project this size.

## 3. Template Syntax vs JSX

`TaskForm.vue` uses `v-model`, `v-for`, and `v-if` heavily. Here is the same idea in both styles.

**Vue (`TaskForm.vue`)**

```vue
<select v-model="form.projectId">
  <option v-for="project in projects" :key="project.id" :value="project.id">
    {{ project.name }}
  </option>
</select>

<input v-model="form.title" type="text" />
<div v-if="form.subtasks.length">{{ form.subtasks.length }} subtasks added</div>
```

**React**

```jsx
<select
  value={form.projectId}
  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
>
  {projects.map((project) => (
    <option key={project.id} value={project.id}>{project.name}</option>
  ))}
</select>

<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
{form.subtasks.length > 0 && <div>{form.subtasks.length} subtasks added</div>}
```

The mapping is straightforward: `v-if` becomes conditional rendering, `v-for` becomes `.map()`, and `v-model` becomes a controlled input. Vue is usually shorter for form-heavy screens because `v-model` removes the repetitive `value + onChange` pairing.

## 4. Computed Properties vs `useMemo`

`HomeView.vue` derives `filteredTasks` from the store plus local filters.

**Vue**

```js
const filteredTasks = computed(() =>
  taskStore
    .filteredTasks(searchQuery.value, selectedPriority.value)
    .filter((task) => String(task.projectId) === String(currentProjectId.value))
);
```

**React**

```jsx
const filteredTasks = useMemo(() => {
  return taskStore
    .filteredTasks(searchQuery, selectedPriority)
    .filter((task) => String(task.projectId) === String(currentProjectId));
}, [taskStore, searchQuery, selectedPriority, currentProjectId]);
```

`computed()` is Vue's default tool for derived state. It tracks dependencies automatically and stays readable. `useMemo()` can express the same idea in React, but you must manage the dependency array yourself and decide whether memoization is worth it.

## 5. Lifecycle

`HomeView.vue` loads tasks and projects on mount.

**Vue**

```js
onMounted(() => {
  if (!taskStore.tasks.length) taskStore.fetchTasks().catch(() => {});
  if (!projectStore.projects.length) projectStore.fetchProjects().catch(() => {});
});
```

**React**

```jsx
useEffect(() => {
  if (!tasks.length) fetchTasks().catch(() => {});
  if (!projects.length) fetchProjects().catch(() => {});
}, [tasks.length, projects.length, fetchTasks, fetchProjects]);
```

`onMounted()` is the "run after mount" hook. React's `useEffect()` is more general and more powerful, but it also asks you to think about dependencies on every effect. Vue's lifecycle hooks are often easier to read when the goal is simply "do this once when the component appears."

## 6. Props and Events

`TaskCard.vue` receives a `task` prop and emits `open-detail`.

**Vue**

```vue
<script setup>
const props = defineProps({ task: { type: Object, required: true } });
const emit = defineEmits(['open-detail']);
const openDetail = () => emit('open-detail', props.task.id);
</script>
```

**React**

```jsx
export default function TaskCard({ task, onOpenDetail }) {
  const openDetail = () => onOpenDetail(task.id);
  return <article onClick={openDetail}>{task.title}</article>;
}
```

Vue makes component inputs and outputs explicit with `defineProps()` and `defineEmits()`. React uses plain function props, so callback-based events are just another prop. The concepts are the same, but Vue names the event channel more directly.

## 7. Routing

This project uses `vue-router` for links, route params, and navigation.

**Vue**

```js
import { RouterLink, useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const currentProjectId = computed(() => String(route.params.id ?? ''));
const goHome = () => router.push('/');
// <RouterLink :to="`/tasks/add?projectId=${currentProjectId}`" />
```

**React**

```jsx
import { Link, useNavigate, useParams } from 'react-router-dom';

const { id } = useParams();
const navigate = useNavigate();
const currentProjectId = id ?? '';
const goHome = () => navigate('/');
// <Link to={`/tasks/add?projectId=${currentProjectId}`} />
```

The mental model is nearly identical: route params come from a hook, programmatic navigation comes from another hook, and links use a router-aware component. The biggest shift is naming: `RouterLink`/`useRoute`/`useRouter` in Vue versus `Link`/`useParams`/`useNavigate` in React Router.

## 8. When to choose Vue over React (and vice versa)

**Choose Vue when:**

- You want form-heavy screens like `TaskForm.vue` to stay concise; `v-model` removes a lot of input boilerplate.
- You like separating logic and markup instead of writing everything inside JSX.
- You want derived UI state like `filteredTasks` to feel automatic through `computed()` and Pinia getters.
- Your team values convention and readability over having many competing patterns for the same problem.

**Choose React when:**

- Your team already thinks in hooks, JSX, and callback props, so the project will move faster with familiar tools.
- You want the broadest ecosystem for component libraries, data fetching tools, and hiring.
- You prefer explicit state updates and dependency arrays, even when they require more code.
- You expect to share patterns with other React apps, especially if your students or teammates already know Zustand, Redux Toolkit, or React Router.
