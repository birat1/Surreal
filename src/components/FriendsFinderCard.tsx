// This component is each user's card on the friends finder page
import { Card, CardContent, CardHeader } from "./ui/card";
import { UserProfileFriendsFinderProps } from "@/types/types";
import defaultProfile from "../assets/default_profile.jpeg";

const FriendsFinderCard = ({ profile }: UserProfileFriendsFinderProps) => {
  const imageSrc =
    typeof profile.profile_picture === "string" &&
    profile.profile_picture.trim() !== ""
      ? profile.profile_picture
      : defaultProfile;

  return (
    <Card className="bg-blue-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      {/* ↓ smaller padding + gap */}
      <CardHeader className="flex flex-col items-center gap-2 pb-1 pt-3">
        <img
          src={imageSrc}
          alt={profile.full_name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold">{profile.full_name}</h2>
      </CardHeader>

      {/* ↓ remove top padding (pt-0) to kill the white gap */}
      <CardContent className="px-4 pb-4 pt-0 space-y-1">
        <p>Age: {profile.age}</p>
        <p>Course: {profile.course}</p>
        <p>Fun Fact: {profile.fun_fact}</p>
      </CardContent>
    </Card>
  );
};

export default FriendsFinderCard;
