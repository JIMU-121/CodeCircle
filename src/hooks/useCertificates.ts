import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CertificateService } from '../services/certificate'

export function useCertificates() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCertificates = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          event_participants (
            events (
              title,
              start_date,
              end_date
            )
          )
        `)
        .eq('event_participants.user_id', userId)

      if (error) throw error
      return data
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const generateCertificate = useCallback(async (participantId: string) => {
    try {
      setLoading(true)
      return await CertificateService.generateCertificate(participantId)
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
    fetchCertificates,
    generateCertificate
  }
} 