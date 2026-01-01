import { useEffect, useState } from 'react';
import UserProfileForm from '@/components/UserProfileForm';
import ProfileCardFullScreen from '@/components/ProfileCardFullScreen';
import FriendsFinderCardPreview from '@/components/FriendsFinderCardPreview';
import type { UserProfileFormData } from '@/types/types';

const EMPTY_PROFILE: UserProfileFormData = {
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
};

const EditProfilePage = () => {
    const [formData, setFormData] =
        useState<UserProfileFormData>(EMPTY_PROFILE);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch(
                'http://localhost:8080/auth/user-profile/me',
                { credentials: 'include' }
            );

            if (!res.ok) return;

            const data = await res.json();
            setFormData(data);
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const previewProfile = {
        user_id: formData.user_id,
        full_name: formData.full_name,
        age: formData.age,
        course: formData.course,
        fun_fact: formData.fun_fact,
        profile_picture: formData.profile_picture,
    };


    if (loading) {
        return <p className="pt-32 text-center">Loading...</p>;
    }

    return (
        <div className="min-h-screen pt-32 grid grid-cols-2 gap-6 p-6 bg-gray-50">
            <div className="bg-white rounded-xl shadow p-6">
                <UserProfileForm
                    formData={formData}
                    setFormData={setFormData}
                    mode="edit"
                />
            </div>

            <div className="bg-white rounded-xl shadow p-6 overflow-auto">
                <ProfileCardFullScreen user_data={formData} />

                <div className="mt-6 flex justify-center">
                    <div className="w-1/2">
                        <FriendsFinderCardPreview profile={previewProfile} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
