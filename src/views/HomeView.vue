<script setup>
import Hero from "@/components/Hero.vue";
import HomeCard from "@/components/HomeCard.vue";
import TaskListings from "@/components/TaskListings.vue";
</script>

<template>
  <Hero title="Welcome to Task Tracker" subtitle="Manage your tasks" />
  <HomeCard />
  <TaskListings :limit="3" :showButton="true" />
</template>