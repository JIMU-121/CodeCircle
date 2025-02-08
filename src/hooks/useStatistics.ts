import { useState, useCallback } from 'react'
import { StatisticsService } from '../services/statistics'

export function useStatistics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      return await StatisticsService.getDashboardStats()
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchDashboardStats
  }
} 