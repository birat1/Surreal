// This page contains the signup form

import { useState } from 'react';

// import { useNavigate } from "react-router-dom";
import ProfileCardFullScreen from '@/components/ProfileCardFullScreen';
// import FriendsFinderCard from '@/components/FriendsFinderCard';
import UserProfileForm from '@/components/UserProfileForm';
import type { UserProfileFormData } from '@/types/types';

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

        // add a show profile_picture
        show_bio: true,
        show_accommodation: true,
        show_languages: true,
        show_ethnicities: true,
        show_home_area: true,
        show_societies: true,
        show_sports: true,
        show_gym_goer: true,
    });

    return (
        <div className="min-h-screen pt-5 grid grid-cols-2 gap-4 p-4 bg-gray-50">
            <div className="min-h-0 bg-white rounded-xl shadow p-4 ">
                <UserProfileForm
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            <div className="min-h-0 bg-white rounded-xl shadow p-4 overflow-auto">
                <ProfileCardFullScreen user_data={formData} />
            </div>
        </div>
    );
};

export default UserProfilePage;
