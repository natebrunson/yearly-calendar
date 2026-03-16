<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '@/lib/auth-client'

const router = useRouter()

onMounted(async () => {
  try {
    const { data } = await authClient.getSession()

    if (data?.session) {
      router.push('/')
    } else {
      router.push('/auth')
    }
  } catch (e) {
    console.error('Auth callback error:', e)
    router.push('/auth')
  }
})
</script>

<template>
  <div class="callback-view">
    <div class="loading-spinner"></div>
    <p class="loading-text">Signing you in...</p>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.callback-view {
  @apply min-h-screen flex flex-col items-center justify-center bg-gray-50;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin;
}

.loading-text {
  @apply mt-4 text-gray-600;
}
</style>
