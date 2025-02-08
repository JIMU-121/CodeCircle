import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function handleNewUser(userId: string, email: string) {
  try {
    await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: 'user'
      })
    return { success: true }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return { success: false, error }
  }
} 