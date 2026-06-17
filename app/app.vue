<script setup lang="ts">
const { token, hydrate } = useToken()
const { apply } = usePrefs()

// SPA: setup runs client-side, so localStorage is available now — hydrate before
// first paint to avoid a TokenGate flash for already-signed-in users.
hydrate()
if (import.meta.client) apply()
</script>

<template>
  <div>
    <WorldCupBanner />
    <TokenGate v-if="!token" />
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
