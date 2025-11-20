// This page contains the signup form

import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import ProfilePreviewFullScreen from "./ProfileCardFullScreen";
import type { UserProfileFormData } from "@/types/types";
import UserProfileForm from "./UserProfileForm";

const UserProfilePage = () => {
  const [formData, setFormData] = useState<UserProfileFormData>({
    full_name: "",
    age: "",
    nickname: "",
    bio: "",
    course: "",
    accomodation: "",
    university_year: "",
    languages: "",
    ethnicity: "",
    home_area: "",
    fun_fact: "",
    societies: [],
    sports: [],
    gym_goer: false,
    profile_picture: null,
  });

  return (
    <div className="h-screen w-full grid grid-cols-2 gap-4 p-4 bg-gray-50">
      
      <div className="grid grid-rows-2 gap-4 h-full overflow-hidden">
        
        <div className="bg-white rounded-xl shadow p-4 overflow-auto">
          <UserProfileForm formData={formData} setFormData={setFormData} />
        </div>

        {/* Bottom-left: Finder Friends preview */}
        <div className="bg-white rounded-xl shadow p-4 overflow-auto">
          <p className="text-gray-500">Finder Friends preview</p>
        </div>
      </div>

      
      <div className="h-full bg-white rounded-xl shadow p-4 overflow-auto">
        <ProfilePreviewFullScreen user_data={formData} />
      </div>
    </div>
  );
};

export default UserProfilePage;
