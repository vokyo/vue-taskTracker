<script setup>
import taskData from '@/tasks.json';
import {ref, defineProps} from 'vue';
import TaskListing from './TaskListing.vue';

const tasks = ref(taskData.tasks);
defineProps({
  limit: Number,
  showButton: {
    type: Boolean,
    default: false
  },
})
console.log(tasks.value);
</script>

<template>
  <section class="bg-blue050 px-4 py-10">
    <div class="container-xl lg:container m-auto">
      <h2 class="text-3xl.font-bold.text-green-500 mb-6 text-center">
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskListing v-for="task in tasks.slice(0, limit || job.length)" :key="task.id" :task="task"/>
      </div>
    </div>
  </section>

  <section v-if="showButton" class="m-auto max-w-lg my-10 px-6">
    <a
        href="/tasks"
        class="block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700"
    >View All Tasks</a
    >
  </section>

</template>