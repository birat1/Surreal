import React from "react";
import type { ProfilePreviewProps } from "@/types/types";
import { Card, CardHeader, CardContent } from "./ui/card";

const ProfilePreviewFullScreen: React.FC<ProfilePreviewProps> = ({
  user_data,
}) => {
  const {
    full_name,
    nickname,
    age,
    bio,
    course,
    accomodation,
    university_year,
    languages,
    ethnicities,
    home_area,
    fun_fact,
    societies,
    sports,
    gym_goer,
    profile_picture,
  } = user_data;

  // helper function for profile picture
  const renderProfileImage = () => {
    if (!profile_picture) {
      return (
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          No image
        </div>
      );
    }

    const src =
      typeof profile_picture === "string"
        ? profile_picture
        : profile_picture instanceof File
        ? URL.createObjectURL(profile_picture)
        : undefined;

    return (
      <img
        src={src}
        alt={full_name || "Profile Picture"}
        className="w-28 h-28 rounded-full object-cover"
      />
    );
  };

  return (
    <Card className="w-full h-full shadow-lg p-4 flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex flex-col items-center">
          {renderProfileImage()}
          <h2 className="text-xl font-bold mt-2">{full_name || "Full Name"}</h2>
          {nickname && <p className="text-gray-500">{nickname}</p>}
          <p className="text-gray-600">{age ? `Age: ${age}` : "Age: -"}</p>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 mb-2">{bio || "Bio goes here..."}</p>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <p>Course: {course || "-"}</p>
          <p>Accommodation: {accomodation || "-"}</p>
          <p>Year: {university_year || "-"}</p>
          <p>Languages: {languages || "-"}</p>
          <p>Ethnicity: {ethnicities || "-"}</p>
          <p>Home Area: {home_area || "-"}</p>
          <p>Gym Goer: {gym_goer || "-"}</p>
          {/* <p>Fun Fact: {fun_fact || "-"}</p> */}

        </div>

        {fun_fact && <p className="mt-2">Fun Fact: {fun_fact}</p>}
        {societies && societies.length > 0 && (
          <p>Societies: {societies.join(", ")}</p>
        )}
        {sports && sports.length > 0 && <p>Sports: {sports.join(", ")}</p>}
      </CardContent>
    </Card>
  );
};

export default ProfilePreviewFullScreen;
