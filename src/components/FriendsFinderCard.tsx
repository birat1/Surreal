// This component is each user's card on the friends finder page
import { Card, CardContent, CardHeader } from "./ui/card";
import { UserProfileFriendsFinderProps } from "@/types/types";

const FriendsFinderCard = ({ profile }: UserProfileFriendsFinderProps) => {
  return (
    <Card className=" bg-blue-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <h2 className="text-lg font-semibold">{profile.full_name}</h2>
      </CardHeader>

      <CardContent className="p-4 space-y-1">
        <p>Age: {profile.age}</p>
        <p>Course: {profile.course}</p>
        <p>Fun Fact: {profile.fun_fact}</p>
      </CardContent>
    </Card>
  );
};

export default FriendsFinderCard;
