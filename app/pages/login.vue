<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Đăng nhập — Habits' })
</script>

<template>
  <div class="grid min-h-[100dvh] place-items-center px-4">
    <div class="fixed right-4 top-4">
      <ThemeToggle />
    </div>
    <LoginForm />
  </div>
</template>
