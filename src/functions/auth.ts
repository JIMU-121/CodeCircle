import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function createUserProfile(userId: string, email: string, fullName: string, phoneNumber: string, bio: string, dateOfBirth: Date) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      phone_number: phoneNumber,
      bio,
      date_of_birth: dateOfBirth,
    })

  if (error) throw error
  return data
} 