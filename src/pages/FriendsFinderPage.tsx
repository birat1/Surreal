import { useEffect, useState } from "react";
import { UserProfileFriendsFinder } from "@/types/types";
import FriendsFinderCard from "@/components/FriendsFinderCard";
import { Button } from "@/components/ui/button";

const FriendsFinderPage = () => {
  const [profiles, setProfiles] = useState<UserProfileFriendsFinder[]>([]);

  // use useEffect so that there is no infinite loop from setProfiles
  useEffect(() => {
    const getUserProfiles = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/user-profiles");
        const data: UserProfileFriendsFinder[] = await res.json();
        setProfiles(data);
      } catch (err) {
        console.error("Failed to fetch profiles", err);
      }
    };

    getUserProfiles();
  }, []);

  return (
    <div className="flex flex-col items-center mt-10 px-6 ">
      <div className="grid grid-cols-4 gap-6">
        {profiles.slice(0, 8).map((profile) => (
          <FriendsFinderCard key={profile.user_id} profile={profile} />
        ))}
      </div>

      <Button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">
        Show More
      </Button>
    </div>
  );
};

export default FriendsFinderPage;
