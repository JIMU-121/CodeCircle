export function validateEventForm(data: {
  title: string
  description: string
  start_date: string
  end_date: string
  max_participants: number
}) {
  const errors: Record<string, string> = {}

  if (!data.title.trim()) {
    errors.title = 'Title is required'
  }

  if (!data.start_date) {
    errors.start_date = 'Start date is required'
  }

  if (!data.end_date) {
    errors.end_date = 'End date is required'
  }

  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    if (end < start) {
      errors.end_date = 'End date must be after start date'
    }
  }

  if (data.max_participants < 0) {
    errors.max_participants = 'Maximum participants cannot be negative'
  }

  return errors
} 