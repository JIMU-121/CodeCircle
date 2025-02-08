import React, { useEffect, useState } from 'react'
import { useStatistics } from '../../hooks/useStatistics'
import { 
  UsersIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  DocumentCheckIcon 
} from '@heroicons/react/24/outline'
import DashboardCharts from '../../components/dashboard/DashboardCharts'

interface DashboardStats {
  totalUsers: number
  totalEvents: number
  totalParticipants: number
  totalCertificates: number
  recentEvents: any[]
  upcomingEvents: any[]
  participantGrowth: { name: string; value: number }[]
  eventsByMonth: { name: string; value: number }[]
}

export default function AdminDashboard() {
  const { loading, error, fetchDashboardStats } = useStatistics()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const data = await fetchDashboardStats()
    setStats(data)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { name: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon },
    { name: 'Total Events', value: stats?.totalEvents || 0, icon: CalendarIcon },
    { name: 'Total Participants', value: stats?.totalParticipants || 0, icon: UserGroupIcon },
    { name: 'Certificates Generated', value: stats?.totalCertificates || 0, icon: DocumentCheckIcon },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts 
        participantData={stats?.participantGrowth || []}
        eventData={stats?.eventsByMonth || []}
      />

      {/* Recent and Upcoming Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Events */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Events</h3>
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {stats?.recentEvents.map((event) => (
                  <li key={event.id} className="py-5">
                    <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                      <h3 className="text-sm font-semibold text-gray-800">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {event.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {new Date(event.start_date).toLocaleDateString()} - 
                        {event.event_participants.count} participants
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Upcoming Events</h3>
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {stats?.upcomingEvents.map((event) => (
                  <li key={event.id} className="py-5">
                    <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                      <h3 className="text-sm font-semibold text-gray-800">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {event.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {new Date(event.start_date).toLocaleDateString()} - 
                        {event.event_participants.count} registered
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 