// This page contains the signup form

import { useState } from 'react';

import FriendsFinderCardPreview from '@/components/FriendsFinderCardPreview';
import ProfileCardFullScreen from '@/components/ProfileCardFullScreen';
import UserProfileForm from '@/components/UserProfileForm';
import type { UserProfileFormData } from '@/types/types';
import type { UserProfileFriendsFinderPreview } from '@/types/types';

const UserProfilePage = () => {
  const [formData, setFormData] = useState<UserProfileFormData>({
    full_name: '',
    is_admin: false,
    age: '',
    username: '',
    bio: '',
    course: '',
    accommodation: '',
    university_year: '',
    languages: [],
    ethnicities: [],
    home_area: '',
    fun_fact: '',
    societies: [],
    sports: [],
    gym_goer: '',
    profile_picture: null,

    show_bio: true,
    show_accommodation: true,
    show_languages: true,
    show_ethnicities: true,
    show_home_area: true,
    show_societies: true,
    show_sports: true,
    show_gym_goer: true,
  });

  const previewProfile: UserProfileFriendsFinderPreview = {
    full_name: formData.full_name || 'Your Name',
    age: formData.age || '',
    course: formData.course || '',
    fun_fact: formData.fun_fact || '',
    profile_picture: formData.profile_picture || null,
  };

  return (
    <div className="min-h-screen pt-32 grid grid-cols-2 gap-4 p-4 bg-gray-50">
      <div className="bg-white rounded-xl shadow p-4">
        <UserProfileForm
          formData={formData}
          setFormData={setFormData}
          mode="create"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <ProfileCardFullScreen user_data={formData} />

        <div className="mt-6">
          <FriendsFinderCardPreview profile={previewProfile} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
