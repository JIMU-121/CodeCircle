import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function handleAuthWebhook(event: any) {
  const { type, record } = event.body

  if (type === 'INSERT' && record?.id) {
    await supabase
      .from('profiles')
      .insert({
        id: record.id,
        email: record.email,
        role: 'user'
      })
  }

  return { statusCode: 200 }
} 