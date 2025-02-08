import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Event } from '../types'

export function useEvents() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = useCallback(async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEventStatus = useCallback(async (eventId: string, status: Event['status']) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEventStatus
  }
} 