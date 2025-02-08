import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { notifyPageSuccess, notifyPageError, notifyInfo } from '../hooks/useToast'
// import { Certificate } from 'crypto'
// import { useAuth } from '../contexts/AuthContext'
// import { useNavigate } from 'react-router-dom'

export default function Events() {
  const [events, setEvents] = useState<any[]>([])
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserId()
    fetchEvents()
    fetchRegisteredEvents()
  }, [])

  async function fetchUserId() {
    const { data } = await supabase.auth.getUser()
    setUserId(data?.user?.id ?? null)
  }

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true })

      if (error) throw error

      setEvents(data)

      if (data.length === 0) {
        notifyInfo('No events available at the moment.')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyPageError('Error loading events: ' + error.message)
      } else {
        notifyPageError('Error loading events: An unknown error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchRegisteredEvents() {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', (await supabase.auth.getUser()).data?.user?.id || '')

      if (error) throw error

      const eventIds = data.map(participant => participant.event_id)
      setRegisteredEventIds(eventIds)
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyPageError('Error fetching registered events: ' + error.message)
      } else {
        notifyPageError('Error fetching registered events: An unknown error occurred.')
      }
    }
  }

  const handleRegister = async (eventId: string) => {
    try {
      const { data, error: userError } = await supabase.auth.getUser()
      const user = data?.user;
      if (userError || !user) {
        console.error('User fetch error:', userError);
        notifyPageError('You must be logged in to register for an event.');
        return;
      }

      const { error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (participantError) throw participantError;

      notifyPageSuccess('Successfully registered for the event!');

      fetchRegisteredEvents();
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyPageError('Error registering for event: ' + error.message)
      } else {
        notifyPageError('Error registering for event: An unknown error occurred.')
      }
    }
  }

  const handleWithdraw = async (eventId: string) => {
    try {
      const { data, error: userError } = await supabase.auth.getUser()
      const user = data?.user;
      if (userError || !user) {
        console.error('User fetch error:', userError);
        notifyPageError('You must be logged in to withdraw from an event.');
        return;
      }

      const { error: withdrawError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (withdrawError) throw withdrawError;

      notifyPageSuccess('Successfully withdrew from the event!');

      fetchRegisteredEvents();
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyPageError('Error withdrawing from event: ' + error.message)
      } else {
        notifyPageError('Error withdrawing from event: An unknown error occurred.')
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900">Upcoming Events</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div>No events available.</div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-bold">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-gray-500">Location: {event.location}</p>
              <p className="text-gray-500">Start Date: {new Date(event.start_date).toLocaleDateString()}</p>
              <p className="text-gray-500">End Date: {new Date(event.end_date).toLocaleDateString()}</p>
              {registeredEventIds.includes(event.id) ? (
                <>
                  <p className="text-green-500 font-semibold">Registration Status: Already Registered</p>
                  <button
                    onClick={() => handleWithdraw(event.id)}
                    className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Withdraw Registration
                  </button>
                </>
              ) : (
                <>
                  <p className="text-green-500 font-semibold">Registration Status: Open</p>
                  <button
                    onClick={() => handleRegister(event.id)}
                    className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Register
                  </button>
                </>
              )}
              {event.status === 'completed' && userId && (
                <button
                  onClick={() => {
                    console.log('Get Certificate clicked for event:', event.id);
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Get Certificate
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}