import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { notifyPageError } from '../hooks/useToast'

export default function MyEvents() {
  const { user } = useAuth()
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([])
  const [liveEvents, setLiveEvents] = useState<any[]>([]); 
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
   
  useEffect(() => {
    if (user) {
      //console.log("User object:", user)
      //localStorage.setItem('user_id', JSON.stringify(user))
      fetchRegisteredEvents()
      fetchAllEvents()
      fetchLiveEvents()
    }
  }, [user])

  async function fetchRegisteredEvents() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id)

      if (error) throw error

      const eventIds = data.map(participant => participant.event_id)
      setRegisteredEvents(eventIds)
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyPageError('Error fetching registered events: ' + error.message)
      } else {
        notifyPageError('Error fetching registered events: An unknown error occurred.')
      }
    }
  }

  async function fetchAllEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true })

      if (error) throw error

      setAllEvents(data)
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyPageError('Error fetching all events: ' + error.message)
      } else {
        notifyPageError('Error fetching all events: An unknown error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }


  async function fetchLiveEvents() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const eventIds = data.map(participant => participant.event_id);
      if (eventIds.length === 0) {
        //console.log("No registered events found.");
        return;
      }

      const { data: liveEventsData, error: liveError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .eq('status', 'live');
      console.log(eventIds);
      if (liveError) throw liveError;

    //  console.log("Live Events Data:", liveEventsData); // Debugging output
      
      setLiveEvents(liveEventsData); // ✅ Correctly storing full event objects

    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyPageError('Error processing event: ' + error.message);
      } else {
        notifyPageError('Error processing event: An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) return <div>Loading...</div>

  const upcomingEvents = allEvents.filter(event => !registeredEvents.includes(event.id))
  const participatedEvents = allEvents.filter(event => registeredEvents.includes(event.id))
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900">My Events</h1>

      <h2 className="text-xl font-semibold mt-6">Registered In Events</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {participatedEvents.length === 0 ? (
          <div>No events participated in yet.</div>
        ) : (
          participatedEvents.map(event => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-bold">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-gray-500">Location: {event.location}</p>
              <p className="text-gray-500">Start Date: {new Date(event.start_date).toLocaleDateString()}</p>
              <p className="text-gray-500">End Date: {new Date(event.end_date).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6">Upcoming Events</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingEvents.length === 0 ? (
          <div>No upcoming events available.</div>
        ) : (
          upcomingEvents.map(event => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-bold">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-gray-500">Location: {event.location}</p>
              <p className="text-gray-500">Start Date: {new Date(event.start_date).toLocaleDateString()}</p>
              <p className="text-gray-500">End Date: {new Date(event.end_date).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6">Live Events</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {liveEvents.length === 0 ? (
          <div>No live events available.</div>
        ) : (
          liveEvents.map(event => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-bold">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-gray-500">Location: {event.location}</p>
              <p className="text-gray-500">Start Date: {new Date(event.start_date).toLocaleDateString()}</p>
              <p className="text-gray-500">End Date: {new Date(event.end_date).toLocaleDateString()}</p>
              <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => window.location.href = `/exam/${event.id}`}>Start Quiz</button>
            </div>
            
          ))
        )}
      </div>
    </div>
  )
}
