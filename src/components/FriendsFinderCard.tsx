import { Card, CardContent, CardHeader } from "./ui/card";
import { UserProfileFriendsFinderProps } from "@/types/types";
import defaultProfile from "../assets/default_profile.jpeg";
import { Maximize2 } from "lucide-react";

const FriendsFinderCard = ({
    profile,
    onMaximise,
}: UserProfileFriendsFinderProps) => {
    const imageSrc =
        typeof profile.profile_picture === "string" &&
        profile.profile_picture.trim() !== ""
            ? profile.profile_picture
            : defaultProfile;

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
                <h2 className="text-lg font-semibold">
                    {profile.full_name}
                </h2>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-0 space-y-1">
                <p>Age: {profile.age}</p>
                <p>Course: {profile.course}</p>
                <p>Fun Fact: {profile.fun_fact}</p>
            </CardContent>
        </Card>
    );
};

export default FriendsFinderCard;
