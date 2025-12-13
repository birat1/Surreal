import { useEffect, useState } from 'react';

import FriendsFinderCard from '@/components/FriendsFinderCard';
import { Button } from '@/components/ui/button';
import { UserProfileFriendsFinder } from '@/types/types';

const FriendsFinderPage = () => {
    const [profiles, setProfiles] = useState<UserProfileFriendsFinder[]>([]);
    const [visibleCount, setVisibleCount] = useState(8);

    // use useEffect so that there is no infinite loop from setProfiles
    useEffect(() => {
        const getUserProfiles = async () => {
            try {
                const res = await fetch('/auth/matched-profiles');
                const data: UserProfileFriendsFinder[] = await res.json();
                setProfiles(data);
            } catch (err) {
                console.error('Failed to fetch profiles', err);
            }
        };

        getUserProfiles();
    }, []);

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 8);
    };

    return (
        <div className="flex flex-col items-center mt-10 px-6">
            <div className="grid grid-cols-4 gap-6">
                {profiles.slice(0, visibleCount).map((profile) => (
                    <FriendsFinderCard
                        key={profile.user_id}
                        profile={profile}
                    />
                ))}
            </div>

            {/* Only show button if there are more profiles */}
            {visibleCount < profiles.length && (
                <Button
                    onClick={handleShowMore}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Show More
                </Button>
            )}
        </div>
    );
};

export default FriendsFinderPage;
