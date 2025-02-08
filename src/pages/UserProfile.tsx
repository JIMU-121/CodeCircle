import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'  
import { supabase } from '../lib/supabase';

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; profile_picture: string | null } | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (error || !user) {
        notifyError('You must be logged in to access this page.');
        navigate('/login'); // Redirect to login if not authenticated
        return;
      }

      // Fetch user profile to check role and picture
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, profile_picture, role')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile fetch error:', profileError);
        notifyError('Unable to retrieve user profile.');
        navigate('/login'); // Redirect to login if profile fetch fails
        return;
      }

      // Check if the role is not 'user'
      if (profileData.role !== 'user') {
        notifyError('You do not have access to this page.');
        navigate('/'); // Redirect to home or another appropriate page
      } else {
        setProfile(profileData); // Set profile data if role is 'user'
      }
    };

    checkUserRole();
  }, [navigate]);

  return (
    <div>
      <h1>User Profile</h1>
      {profile && (
        <div>
          <h2>{profile.full_name}</h2>
          {/* Conditionally render the profile picture */}
          {profile.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" />
          ) : (
            <p>No profile picture available.</p> // Optional message if no picture
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 

function notifyError(_arg0: string) {
    throw new Error('Function not implemented.');
}
