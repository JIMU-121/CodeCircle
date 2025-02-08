import { useState, useCallback } from 'react'
import { UserService } from '../services/user'
import { Profile } from '../types'

export function useUsers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      return await UserService.getUsers()
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserRole = useCallback(async (userId: string, role: Profile['role']) => {
    try {
      setLoading(true)
      return await UserService.updateUserRole(userId, role)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (userId: string, profile: Partial<Profile>) => {
    try {
      setLoading(true)
      return await UserService.updateProfile(userId, profile)
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
    fetchUsers,
    updateUserRole,
    updateProfile
  }
} 