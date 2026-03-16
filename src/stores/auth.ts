import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authClient } from '@/lib/auth-client'

interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
  emailVerified: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state from Better Auth session
  async function initialize() {
    loading.value = true

    try {
      const { data } = await authClient.getSession()
      user.value = data?.user ?? null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize auth'
      console.error('Auth initialization error:', e)
    } finally {
      loading.value = false
    }
  }

  // Sign in with Google OAuth
  async function signInWithGoogle() {
    error.value = null

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign in'
      console.error('Sign in error:', e)
    }
  }

  // Sign in with Apple OAuth
  async function signInWithApple() {
    error.value = null

    try {
      await authClient.signIn.social({
        provider: 'apple',
        callbackURL: '/',
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign in'
      console.error('Sign in error:', e)
    }
  }

  // Sign out
  async function signOut() {
    error.value = null

    try {
      await authClient.signOut()
      user.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign out'
      console.error('Sign out error:', e)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initialize,
    signInWithGoogle,
    signInWithApple,
    signOut,
  }
})
