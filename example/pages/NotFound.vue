<script setup lang="ts">
import { demoText } from "../utils/demoI18n.ts";
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">404</h1>
      <p class="text-muted-foreground mb-4">{{ demoText.pageNotFound }}</p>
      <RouterLink to="/" class="text-primary hover:underline">{{ demoText.goHome }}</RouterLink>
    </div>
  </div>
</template>
