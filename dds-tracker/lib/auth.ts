import type { User } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

export async function getAuthUser(): Promise<User | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Auth user load error:', error)
    return null
  }
  return data.user ?? null
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      data: { user: null, session: null },
      error: new Error('Supabase env is not configured.'),
    }
  }
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      data: { user: null, session: null },
      error: new Error('Supabase env is not configured.'),
    }
  }
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  })
}

export async function signOutUser() {
  const supabase = getSupabase()
  if (!supabase) {
    return { error: null }
  }
  return supabase.auth.signOut()
}
