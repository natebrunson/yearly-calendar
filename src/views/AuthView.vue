<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Year Calendar</h1>
        <p class="auth-subtitle">Plan your entire year at a glance</p>
      </div>

      <div class="auth-body">
        <p class="auth-description">
          Sign in to create and sync your calendar events across devices.
        </p>

        <button
          class="google-button"
          @click="authStore.signInWithGoogle"
          :disabled="authStore.loading"
        >
          <svg class="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          class="apple-button"
          @click="authStore.signInWithApple"
          :disabled="authStore.loading"
        >
          <svg class="apple-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
            />
          </svg>
          <span>Continue with Apple</span>
        </button>

        <p v-if="authStore.error" class="auth-error">
          {{ authStore.error }}
        </p>
      </div>

      <div class="auth-footer">
        <p class="auth-features">
          ✓ 12-month year view &nbsp;&nbsp; ✓ Multi-day events &nbsp;&nbsp; ✓ Cloud sync
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.auth-view {
  @apply min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4;
}

.auth-card {
  @apply bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden;
}

.auth-header {
  @apply bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center;
}

.auth-title {
  @apply text-3xl font-bold text-white;
}

.auth-subtitle {
  @apply text-blue-100 mt-2;
}

.auth-body {
  @apply px-8 py-8;
}

.auth-description {
  @apply text-gray-600 text-center mb-6;
}

.google-button {
  @apply w-full flex items-center justify-center gap-3 px-4 py-3
         border border-gray-300 rounded-lg shadow-sm
         bg-white hover:bg-gray-50 transition-colors
         text-gray-700 font-medium;
}

.google-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.google-icon {
  @apply w-5 h-5;
}

.apple-button {
  @apply w-full flex items-center justify-center gap-3 px-4 py-3 mt-3
         border border-gray-300 rounded-lg shadow-sm
         bg-black hover:bg-gray-900 transition-colors
         text-white font-medium;
}

.apple-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.apple-icon {
  @apply w-5 h-5;
}

.auth-error {
  @apply mt-4 text-center text-red-600 text-sm;
}

.auth-footer {
  @apply bg-gray-50 px-8 py-4 border-t border-gray-100;
}

.auth-features {
  @apply text-xs text-gray-500 text-center;
}
</style>
