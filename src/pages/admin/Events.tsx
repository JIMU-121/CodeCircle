import React, { useState, useEffect } from 'react'
import { useEvents } from '../../hooks/useEvents'
import { Event } from '../../types'
//import { useToast } from '../../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { notifyPageError, notifyPageSuccess } from '../../hooks/useToast'

export default function AdminEvents() {
  //const notify = useToast()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const { loading, error, fetchEvents, createEvent, updateEventStatus } = useEvents()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: 0,
    status: 'draft' as Event['status'],
    type: 'quiz' as Event['type']
  })

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    const data = await fetchEvents()
    setEvents(data)
  }
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const startDate = new Date(formData.start_date)
  if (startDate <= new Date()) {
    notifyPageError('Start date must be in the future.')
    return
  }
  // Validate end date: it should not be before start date
  const endDate = new Date(formData.end_date)
  if (endDate < startDate) {
    notifyPageError('End date cannot be before start date.')
    return
  }
    try {
      await createEvent({
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        /// Add this line to include the quizQuestions property
      })
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: 0,
        status: 'draft',
        type: 'quiz'
      })
      setShowForm(false)
      loadEvents()
      notifyPageSuccess('Event created successfully!')
    } catch (error: any) {
      notifyPageError(error.message)
    }
  }

  async function handleStatusChange(eventId: string, newStatus: Event['status']) {
    const currentEvent = events.find(event => event.id === eventId)
    if (!currentEvent) return

    if (currentEvent.status === 'draft' && newStatus === 'published') {
      try {
        await updateEventStatus(eventId, newStatus)
        loadEvents()
        notifyPageSuccess('Event status updated to published!')

        // Redirect to create quiz page
        //navigate(`/admin/create-quiz/${eventId}`)

      } catch (error: any) {
        notifyPageError(error.message)
      }
    } else if (currentEvent.status === 'published' && newStatus === 'live') {
      const { data: questions, error: questionsError } = await supabase
        .from('questionbank')
        .select('*')
        .eq('event_id', eventId)

      if (questionsError) {
        notifyPageError('Error checking questions: ' + questionsError.message)
        return
      }

      if (questions.length === 0) {
        notifyPageError('Please add questions before setting the event to live.')
        return
      }

      try {
        await updateEventStatus(eventId, newStatus)
        loadEvents()
        notifyPageSuccess(`Event status updated to ${newStatus}!`)
      } catch (error: any) {
        notifyPageError(error.message)
      }
    } else if (currentEvent.status === 'published' || currentEvent.status === 'live' && (newStatus === 'completed' || newStatus === 'cancelled')) {
      const { data: questions, error: questionsError } = await supabase
        .from('questionbank')
        .select('*')
        .eq('event_id', eventId)

      if (questionsError) {
        notifyPageError('Error checking questions: ' + questionsError.message)
        return
      }

      if (!questions || questions.length === 0) {
        notifyPageError('Please add questions before setting the event to completed.')
        return
      }

      try {
        await updateEventStatus(eventId, newStatus)
        loadEvents()
        notifyPageSuccess(`Event status updated to ${newStatus}!`)
      } catch (error: any) {
        notifyPageError(error.message)
      }
    } else {
      notifyPageError('Invalid status change!')
    }
}
// async function handleStatusOnComplete(eventId:string, newStatus : Event['status']) {
//   const currentEvent = events.find(event => event.id === eventId)
//   if(!currentEvent){
//     return
//   }
//   if(currentEvent.status === 'complete'){
//     try{
      
//     }
//   }
  
// }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading events</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Events</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="mt-1 block w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required className="mt-1 block w-full p-2 border rounded-md"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleInputChange} required className="mt-1 block w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleInputChange} required className="mt-1 block w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="mt-1 block w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Participants</label>
              <input type="number" name="max_participants" value={formData.max_participants} onChange={handleInputChange} required className="mt-1 block w-full p-2 border rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-6 border-t px-4 py-4">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-semibold text-gray-900">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-3 py-2 rounded-md">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Title
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {event.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(event.start_date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {event.location}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        event.status === 'published' ? 'bg-green-100 text-green-800' :
                        event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <select
                        value={event.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as Event['status']
                          handleStatusChange(event.id, newStatus)
                        }}
                        className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        disabled={event.status === 'completed' || event.status === 'cancelled'}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                        {/* Show the "Create Quiz" button if the status is 'published' */}
                      {event.status === 'published' && (
                        <button
                          onClick={() => {
                            navigate(`/admin/create-quiz/${event.id}`)}}
                          className=" px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ml-4"
                        >
                          Create Quiz
                        </button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
