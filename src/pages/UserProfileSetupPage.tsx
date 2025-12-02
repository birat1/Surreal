// This page contains the signup form

import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import ProfilePreviewFullScreen from "@/components/ProfileCardFullScreen";
import type { UserProfileFormData } from "@/types/types";
import UserProfileForm from "@/components/UserProfileForm";

const UserProfilePage = () => {
  const [formData, setFormData] = useState<UserProfileFormData>({
    full_name: "",
    age: "",
    nickname: "",
    bio: "",
    course: "",
    accomodation: "",
    university_year: "",
    languages: [],
    ethnicities: [],
    home_area: "",
    fun_fact: "",
    societies: [],
    sports: [],
    gym_goer: "",
    profile_picture: null,
  });

  return (
    <div className="min-h-screen pt-5 grid grid-cols-2 gap-4 p-4 bg-gray-50">

      <div className="min-h-0 bg-white rounded-xl shadow p-4 ">
        <UserProfileForm formData={formData} setFormData={setFormData} />
      </div>

      <div className="min-h-0 bg-white rounded-xl shadow p-4 overflow-auto">
        <ProfilePreviewFullScreen user_data={formData} />
      </div>
    </div>
  );
};

export default UserProfilePage;
