<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_48%,_#f8fafc_100%)]">
    <div class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section
        class="w-full rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-12"
      >
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <i class="pi pi-exclamation-circle text-4xl" />
        </div>

        <p class="mt-6 text-sm font-semibold uppercase tracking-[0.32em] text-sky-600">
          404
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Page Not Found
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          The page you requested may have moved, been removed, or the URL may be incorrect. Head back home to keep exploring your projects and task boards.
        </p>

        <RouterLink
          to="/"
          class="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <i class="pi pi-home text-sm" />
          Back to Home
        </RouterLink>
      </section>
    </div>
  </div>
</template>
