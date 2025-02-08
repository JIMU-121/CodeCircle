export interface Event {
  quizQuestions: any
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  max_participants: number
  status: 'draft' | 'published' | 'completed' | 'cancelled' | 'live'
  type: 'quiz' | 'coding'
  created_by: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  registration_date: string
  attendance_status: boolean
  certificate_generated: boolean
  certificate_url?: string
} 