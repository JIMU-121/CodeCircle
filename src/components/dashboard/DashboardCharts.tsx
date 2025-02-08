import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

interface ChartData {
  name: string
  value: number
}

interface Props {
  participantData: ChartData[]
  eventData: ChartData[]
}

export default function DashboardCharts({ participantData, eventData }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-[400px] rounded-lg bg-white p-6 shadow">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Participant Growth</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={participantData}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#6366F1" fill="#818CF8" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[400px] rounded-lg bg-white p-6 shadow">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Events by Month</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={eventData}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 