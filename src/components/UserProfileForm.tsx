import { Card, CardHeader, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useAuth } from '@/context/AuthContext';
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
import {
  ACCOMMODATIONS,
  UNIVERSITY_YEARS,
  LANGUAGES,
  ETHNICITIES,
  SPORTS,
  SOCIETIES,
  COURSES,
} from "@/data/dummy_data";
import VisibilityToggle from "./UserProfileFormVisibilityToggle";

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  formData,
  setFormData,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    field: "languages" | "ethnicities" | "sports" | "societies",
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
        const data = await res.json();

        if (data.jwt_token) {
          console.log("Logging in with new token from profile setup");
          login(data.jwt_token);
        } else {
          console.warn("Backend did not return a new token. Nickname will not update until relogin.");
        }

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

          <div className="flex flex-col gap-1">
            <Input
              name="nickname"
              placeholder="Nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="border-blue-300 text-blue-600 focus:ring-blue-500"
            />

            <VisibilityToggle
              label="Show Nickname"
              checked={formData.show_nickname}
              onChange={(value) =>
                setFormData({ ...formData, show_nickname: value })
              }
            />
          </div>

          {/*Course */}
          <Select
            value={formData.course}
            onValueChange={(value) =>
              setFormData({ ...formData, course: value })
            }
          >
            <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
              <SelectValue placeholder="Course" />
            </SelectTrigger>

            <SelectContent
              className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600
             max-h-48 overflow-y-auto"
            >
              <SelectGroup>
                <SelectLabel className="text-blue-700 text-xs px-2">
                  Course
                </SelectLabel>
                {COURSES.map((course) => (
                  <SelectItem
                    key={course}
                    value={course}
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                  >
                    {course}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/*accommodations */}
          <div className="flex flex-col gap-1">
            <Select
              value={formData.accommodation}
              onValueChange={(value) =>
                setFormData({ ...formData, accommodation: value })
              }
            >
              <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
                <SelectValue placeholder="Accommodation" />
              </SelectTrigger>

              <SelectContent
                className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600
             max-h-48 overflow-y-auto"
              >
                <SelectGroup>
                  <SelectLabel className="text-blue-700 text-xs px-2">
                    Accommodation
                  </SelectLabel>
                  {ACCOMMODATIONS.map((accommodation) => (
                    <SelectItem
                      key={accommodation}
                      value={accommodation}
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                    >
                      {accommodation}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <VisibilityToggle
              label="Show Accommodation"
              checked={formData.show_accommodation}
              onChange={(value) =>
                setFormData({ ...formData, show_accommodation: value })
              }
            />
          </div>

          {/*university year */}
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
                <SelectLabel className="text-blue-700 text-xs px-2">
                  University Year
                </SelectLabel>
                {UNIVERSITY_YEARS.map((university_year) => (
                  <SelectItem
                    key={university_year}
                    value={university_year}
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                  >
                    {university_year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* languages */}
          <div className="flex flex-col gap-1">
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
                    <SelectLabel className="text-blue-700 text-xs px-2">
                      Languages
                    </SelectLabel>
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

            <VisibilityToggle
              label="Show Languages"
              checked={formData.show_languages}
              onChange={(value) =>
                setFormData({ ...formData, show_languages: value })
              }
            />
          </div>

          {/* ethnicities */}
          <div className="flex flex-col gap-1">
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
                  <SelectValue placeholder="Ethnicities (up to 3)" />
                </SelectTrigger>

                <SelectContent
                  className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600
             max-h-48 overflow-y-auto"
                >
                  <SelectGroup>
                    <SelectLabel className="text-blue-700 text-xs px-2">
                      Ethnicities
                    </SelectLabel>
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

            <VisibilityToggle
              label="Show Ethnicities"
              checked={formData.show_ethnicities}
              onChange={(value) =>
                setFormData({ ...formData, show_ethnicities: value })
              }
            />
          </div>

          {/* sports */}
          <div className="flex flex-col gap-1">
            <div className="w-full">
              <Select
                value=""
                onValueChange={(value) => {
                  if (formData.sports.includes(value)) return;
                  if (formData.sports.length >= 3) return;

                  setFormData({
                    ...formData,
                    sports: [...formData.sports, value],
                  });
                }}
              >
                <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
                  <SelectValue placeholder="Sports (up to 3)" />
                </SelectTrigger>

                <SelectContent
                  className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600
             max-h-48 overflow-y-auto"
                >
                  <SelectGroup>
                    <SelectLabel className="text-blue-700 text-xs px-2">
                      Sports
                    </SelectLabel>
                    {SPORTS.map((sport) => (
                      <SelectItem
                        key={sport}
                        value={sport}
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                      >
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.sports.map((sport) => (
                  <div
                    key={sport}
                    className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {sport}
                    <button
                      className="ml-2 text-blue-700 hover:text-red-600 font-bold"
                      onClick={() => handleRemoveItem("sports", sport)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <VisibilityToggle
              label="Show Sports"
              checked={formData.show_sports}
              onChange={(value) =>
                setFormData({ ...formData, show_sports: value })
              }
            />
          </div>

          {/* Societiies */}
          <div className="flex flex-col gap-1">
            <div className="w-full">
              <Select
                value=""
                onValueChange={(value) => {
                  if (formData.societies.includes(value)) return;
                  if (formData.societies.length >= 5) return;

                  setFormData({
                    ...formData,
                    societies: [...formData.societies, value],
                  });
                }}
              >
                <SelectTrigger className="w-full border-blue-300 text-blue-600 focus:ring-blue-500">
                  <SelectValue placeholder="Societies (up to 5)" />
                </SelectTrigger>

                <SelectContent
                  className="bg-white border border-gray-200 rounded-md shadow-lg text-blue-600
             max-h-48 overflow-y-auto"
                >
                  <SelectGroup>
                    <SelectLabel className="text-blue-700 text-xs px-2">
                      Societies
                    </SelectLabel>
                    {SOCIETIES.map((society) => (
                      <SelectItem
                        key={society}
                        value={society}
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                      >
                        {society}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.societies.map((society) => (
                  <div
                    key={society}
                    className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {society}
                    <button
                      className="ml-2 text-blue-700 hover:text-red-600 font-bold"
                      onClick={() => handleRemoveItem("societies", society)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <VisibilityToggle
              label="Show Societies"
              checked={formData.show_societies}
              onChange={(value) =>
                setFormData({ ...formData, show_societies: value })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <Input
              name="home_area"
              placeholder="Home Area"
              value={formData.home_area}
              onChange={handleChange}
              className="border-blue-300 text-blue-600 focus:ring-blue-500"
            />

            <VisibilityToggle
              label="Show Home Area"
              checked={formData.show_home_area}
              onChange={(value) =>
                setFormData({ ...formData, show_home_area: value })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
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
                  <SelectLabel className="text-blue-700 text-xs px-2">
                    Do you go to the gym?
                  </SelectLabel>
                  <SelectItem
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                    value="yes"
                  >
                    Yes
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                    value="no"
                  >
                    No
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <VisibilityToggle
              label="Show Gym Status"
              checked={formData.show_gym_goer}
              onChange={(value) =>
                setFormData({ ...formData, show_gym_goer: value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col mt-2">
          <label
            htmlFor="fun_fact"
            className="text-sm font-medium text-orange-300 "
          >
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
