import { supabase } from '../lib/supabase'
import { Profile } from '../types'

export class UserService {
  static async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async updateUserRole(userId: string, role: Profile['role']) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateProfile(userId: string, profile: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
} 