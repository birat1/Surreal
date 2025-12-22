import { MessageCircle, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { UserProfileFriendsFinderProps } from '@/types/types';

import defaultProfile from '../assets/default_profile.jpeg';

import { Card, CardContent, CardHeader } from './ui/card';

const FriendsFinderCard = ({
    profile,
    onMaximise,
}: UserProfileFriendsFinderProps) => {
    const navigate = useNavigate();
    const { userId: currentUserId } = useAuth();

    let imageSrc = defaultProfile;

    if (
        profile.profile_picture &&
        typeof profile.profile_picture === 'string'
    ) {
        const pic = profile.profile_picture.trim();

        if (pic !== '') {
            // Handle if its a relative path from the backend
            if (pic.startsWith('/')) {
                const filename = pic.split('/').pop();

                imageSrc = `http://localhost:8080/images/${profile.user_id}/avatar/${filename}`;
            }
            // Handle if its from an URL (Cloud Storage?)
        }
    }

    const handleSendMessage = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (!currentUserId || !profile.user_id) {
            console.error('Missing user IDs for messaging.');
            return;
        }

        console.log('Current User ID:', currentUserId);
        console.log('Recipient User ID:', profile.user_id);
        console.log('Recipient Name:', profile.username);

        navigate(`/messages/new`, {
            state: {
                recipientId: profile.user_id,
                recipientName: profile.username,
            },
        });
    };

    return (
        <Card className="relative bg-blue-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            {/* Maximise button (top-right) */}
            {onMaximise && (
                <button
                    onClick={onMaximise}
                    aria-label="View profile"
                    className="
                        absolute top-3 right-3
                        p-2 rounded-full
                        bg-white/80 backdrop-blur
                        text-blue-600
                        shadow
                        hover:bg-blue-600 hover:text-white
                        transition
                    "
                >
                    <Maximize2 size={16} />
                </button>
            )}

            <CardHeader className="flex flex-col items-center gap-2 pb-1 pt-4">
                <img
                    src={imageSrc}
                    alt={profile.full_name}
                    className="w-14 h-14 rounded-full object-cover"
                />
                <h2 className="text-lg font-semibold">{profile.full_name}</h2>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-0 space-y-1">
                <p>Age: {profile.age}</p>
                <p>Course: {profile.course}</p>
                <p>Fun Fact: {profile.fun_fact}</p>

                <button
                    onClick={handleSendMessage}
                    aria-label="Send Message"
                    className="
                        w-full mt-4
                        flex items-center justify-center gap-2
                        bg-blue-600 text-white
                        py-2 px-4 rounded-md
                        font-medium text-xs
                        hover:bg-blue-700 active:bg-blue-800
                        transition-colors
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                    "
                >
                    <MessageCircle size={16} />
                    Send Message
                </button>
            </CardContent>
        </Card>
    );
};

export default FriendsFinderCard;
