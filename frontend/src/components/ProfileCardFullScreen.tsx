import React from 'react';

import type { ProfilePreviewProps } from '@/types/types';

import defaultProfile from '../assets/default_profile.jpeg';

import { Card, CardHeader, CardContent } from './ui/card';

const ProfileCardFullScreen: React.FC<ProfilePreviewProps> = ({
    user_data,
}) => {
    const {
        user_id,
        profile_picture,
        full_name,
        username,
        age,
        bio,
        course,
        accommodation,
        university_year,
        languages,
        ethnicities,
        home_area,
        fun_fact,
        societies,
        sports,
        gym_goer,
        show_bio,
        show_accommodation,
        show_languages,
        show_ethnicities,
        show_home_area,
        show_societies,
        show_sports,
        show_gym_goer,
    } = user_data;

    const renderProfileImage = () => {
        const src = (() => {
            // File (preview before upload)
            if (profile_picture instanceof File) {
                return URL.createObjectURL(profile_picture);
            }

            // String path/URL from backend
            if (typeof profile_picture === 'string') {
                const s = profile_picture.trim();

                // guard against bad strings
                if (s && s !== 'null' && s !== 'undefined') {
                    // Check for relative path
                    if (s.startsWith('/')) {
                        const filename = s.split('/').pop();
                        return `http://localhost:8080/images/${user_id}/avatar/${filename}`;
                    }
                    // If using cloud storage (check for http/https)
                }
            }

            // Fallback
            return defaultProfile;
        })();

        return (
            <img
                src={src}
                alt={full_name || 'Profile Picture'}
                className="w-28 h-28 rounded-full object-cover"
            />
        );
    };

    return (
        <Card className="w-full max-w-2xl shadow-lg p-4 flex flex-col">
            <CardHeader>
                <div className="flex flex-col items-center text-center">
                    {renderProfileImage()}
                    <h2 className="text-xl font-bold mt-2">
                        {full_name || 'Full Name'}
                    </h2>
                    {username && <p className="text-gray-500">{username}</p>}
                    <p className="text-gray-600">
                        {age ? `Age: ${age}` : 'Age: -'}
                    </p>
                </div>
            </CardHeader>

            <CardContent>
                {show_bio && (
                    <p className="text-gray-700 mb-2">
                        {bio || 'Bio goes here...'}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>Course: {course || '-'}</p>

                    {show_accommodation && (
                        <p>Accommodation: {accommodation || '-'}</p>
                    )}

                    <p>Year: {university_year || '-'}</p>

                    {show_languages && (
                        <p>Languages: {languages?.join(', ') || '-'}</p>
                    )}

                    {show_ethnicities && (
                        <p>Ethnicity: {ethnicities?.join(', ') || '-'}</p>
                    )}

                    {show_sports && <p>Sports: {sports?.join(', ') || '-'}</p>}

                    {show_societies && (
                        <p>Societies: {societies?.join(', ') || '-'}</p>
                    )}

                    {show_home_area && <p>Home Area: {home_area || '-'}</p>}

                    {show_gym_goer && <p>Gym Goer: {gym_goer || '-'}</p>}

                    <p>Fun Fact: {fun_fact || '-'}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileCardFullScreen;
