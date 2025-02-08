import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Profile() {
  const { user, profile } = useAuth()
  const notify = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '')
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          bio,
          date_of_birth: dateOfBirth || null, // Ensure date_of_birth is set to null if dateOfBirth is undefined
        })
        .eq('id', user?.id) // Use optional chaining to prevent potential null reference

      if (error) throw error
      notify('Profile updated successfully!', 'success')
      setIsEditing(false) // Exit edit mode after successful update
    } catch (error: unknown) {
      if (error instanceof Error) {
        notify('Error updating profile: ' + error.message, 'error')
      } else {
        notify('Error updating profile: An unknown error occurred.', 'error')
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Information</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            ) : (
              <p className="mt-1 text-gray-600">{fullName || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            {isEditing ? (
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            ) : (
              <p className="mt-1 text-gray-600">{phoneNumber || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            ) : (
              <p className="mt-1 text-gray-600">{bio || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            ) : (
              <p className="mt-1 text-gray-600">{dateOfBirth || '-'}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          {isEditing ? (
            <button
              onClick={handleUpdateProfile}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Update Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
