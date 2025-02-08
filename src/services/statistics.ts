import { supabase } from '../lib/supabase'

export class StatisticsService {
  static async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalEvents,
        totalParticipants,
        totalCertificates,
        recentEvents,
        upcomingEvents
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getTotalEvents(),
        this.getTotalParticipants(),
        this.getTotalCertificates(),
        this.getRecentEvents(),
        this.getUpcomingEvents()
      ])

      return {
        totalUsers,
        totalEvents,
        totalParticipants,
        totalCertificates,
        recentEvents,
        upcomingEvents
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  private static async getTotalUsers() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }

  private static async getTotalEvents() {
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }

  private static async getTotalParticipants() {
    const { count, error } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }

  private static async getTotalCertificates() {
    const { count, error } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }

  private static async getRecentEvents(limit = 5) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_participants (count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  private static async getUpcomingEvents(limit = 5) {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_participants (count)
      `)
      .gt('start_date', now)
      .order('start_date', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  }

  static async getParticipantGrowth() {
    const { data, error } = await supabase
      .from('event_participants')
      .select('registration_date')
      .order('registration_date', { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData = data.reduce((acc: Record<string, number>, item) => {
      const month = new Date(item.registration_date).toLocaleString('default', { month: 'short' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    return Object.entries(monthlyData).map(([name, value]) => ({ name, value }))
  }

  static async getEventsByMonth() {
    const { data, error } = await supabase
      .from('events')
      .select('start_date')
      .order('start_date', { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData = data.reduce((acc: Record<string, number>, item) => {
      const month = new Date(item.start_date).toLocaleString('default', { month: 'short' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    return Object.entries(monthlyData).map(([name, value]) => ({ name, value }))
  }
} 