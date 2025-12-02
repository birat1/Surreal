import { Card, CardHeader, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import type { UserProfileFormProps } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, ETHNICITIES } from "@/data/dummy_data";

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  formData,
  setFormData,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, profile_picture: file });
  };

  const handleRemoveItem = (
    field: "languages" | "ethnicities",
    valueToRemove: string
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((value) => value !== valueToRemove),
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      alert("You must be logged in to set up your profile.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/user-profile-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Profile created successfully!");
        navigate("/friends-finder");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Error creating profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full h-full shadow-lg p-4 bg-white overflow-y-auto border border-blue-700">
      <CardHeader>
        <h2 className="text-blue-600 text-2xl font-bold text-center">
          Set Up Your Profile
        </h2>
        <p className="text-blue-700 text-center text-sm mt-2">
          Welcome to Surreal! Don't worry — you can change these later.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full">
            <Input
              ref={fileInput}
              type="file"
              name="profile_picture"
              accept="image/*"
              onChange={handleFileChange}
              className="border-blue-300 text-blue-600 focus:ring-blue-500"
            />

            {formData.profile_picture && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:Text-red-600 font-bold"
                onClick={() => {
                  setFormData({ ...formData, profile_picture: null });

                  if (fileInput.current) {
                    fileInput.current.value = "";
                  }
                }}
              >
                x
              </button>
            )}
          </div>

          <Input
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className="border-blue-300 text-blue-600 focus:ring-blue-500"
          />

          <Input
            name="age"
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="border-blue-300 text-blue-600 focus:ring-blue-500"
          />

          <Input
            name="nickname"
            placeholder="Nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="border-blue-300 text-blue-600 focus:ring-blue-500"
          />

          <Input
            name="course"
            placeholder="Course"
            value={formData.course}
            onChange={handleChange}
            className="border-blue-300 text-blue-600 focus:ring-blue-500"
          />

          <Select
            value={formData.accomodation}
            onValueChange={(value) =>
              setFormData({ ...formData, accomodation: value })
            }
          >
            <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
              <SelectValue placeholder="Accommodation" />
            </SelectTrigger>

            <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600">
              <SelectGroup>
                <SelectLabel className="text-blue-600">
                  Accommodation
                </SelectLabel>
                <SelectItem
                  value="Stag Hill"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Stag Hill
                </SelectItem>

                <SelectItem
                  value="Manor Park"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Manor Park
                </SelectItem>

                <SelectItem
                  value="Private Housing"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Private Housing
                </SelectItem>

                <SelectItem
                  value="Commuting"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Commuting
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={formData.university_year}
            onValueChange={(value) =>
              setFormData({ ...formData, university_year: value })
            }
          >
            <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
              <SelectValue placeholder="University Year" />
            </SelectTrigger>

            <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600">
              <SelectGroup>
                <SelectLabel className="text-blue-600">
                  University Year
                </SelectLabel>
                <SelectItem
                  value="Foundation"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Foundation
                </SelectItem>

                <SelectItem
                  value="First Year"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  First Year
                </SelectItem>

                <SelectItem
                  value="Second year"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Second Year
                </SelectItem>

                <SelectItem
                  value="Placement"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Placement
                </SelectItem>
                <SelectItem
                  value="Third Year"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Third Year
                </SelectItem>
                <SelectItem
                  value="Masters"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                >
                  Masters
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* languages */}
          <div className="w-full">
            <Select
              value=""
              onValueChange={(value) => {
                if (formData.languages.includes(value)) return;
                if (formData.languages.length >= 3) return;

                setFormData({
                  ...formData,
                  languages: [...formData.languages, value],
                });
              }}
            >
              <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
                <SelectValue placeholder="Languages (up to 3)" />
              </SelectTrigger>

              <SelectContent
                className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600
             max-h-48 overflow-y-auto"
              >
                <SelectGroup>
                  {LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang}
                      value={lang}
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                    >
                      {lang}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages.map((lang) => (
                <div
                  key={lang}
                  className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {lang}
                  <button
                    className="ml-2 text-blue-700 hover:text-red-600 font-bold"
                    onClick={() => handleRemoveItem("languages", lang)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ethnicities */}
          <div className="w-full">
            <Select
              value=""
              onValueChange={(value) => {
                if (formData.ethnicities.includes(value)) return;
                if (formData.ethnicities.length >= 3) return;

                setFormData({
                  ...formData,
                  ethnicities: [...formData.ethnicities, value],
                });
              }}
            >
              <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
                <SelectValue placeholder="Ethnicity (up to 3)" />
              </SelectTrigger>

              <SelectContent
                className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600
             max-h-48 overflow-y-auto"
              >
                <SelectGroup>
                  {ETHNICITIES.map((ethnicity) => (
                    <SelectItem
                      key={ethnicity}
                      value={ethnicity}
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                    >
                      {ethnicity}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.ethnicities.map((ethnicity) => (
                <div
                  key={ethnicity}
                  className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {ethnicity}
                  <button
                    className="ml-2 text-blue-700 hover:text-red-600 font-bold"
                    onClick={() => handleRemoveItem("ethnicities", ethnicity)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Input
            name="home_area"
            placeholder="Home Area"
            value={formData.home_area}
            onChange={handleChange}
            className="border-blue-300 text-blue-600 focus:ring-blue-500"
          />

          <Select
            value={formData.gym_goer}
            onValueChange={(value) =>
              setFormData({ ...formData, gym_goer: value })
            }
          >
            <SelectTrigger className="w-full border-blue-300 text-blue-600">
              <SelectValue placeholder="Do you go to the gym?" />
            </SelectTrigger>

            <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600">
              <SelectGroup>
                <SelectLabel className="text-blue-600 text-xs px-2 opacity-70">
                  Do you go to the gym?
                </SelectLabel>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          
        </div>

        <div className="flex flex-col mt-2">
          <label htmlFor="fun_fact" className="text-sm font-medium text-orange-300 ">
            Fun Fact
          </label>
          <Textarea
            id="fun_fact"
            name="fun_fact"
            placeholder="Give us a fun fact about yourself!!!!!!!!"
            value={formData.fun_fact}
            onChange={handleChange}
            className="border-orange-400 text-orange-300 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col mt-2">
          <label htmlFor="bio" className="text-sm font-medium text-blue-600 ">
            Bio
          </label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={handleChange}
            className="border-blue-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <Button
          className=" mt-4 border-blue-300 text-blue-600"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save and Continue"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
