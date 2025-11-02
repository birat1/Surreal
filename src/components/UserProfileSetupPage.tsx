import { useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); //e.target.name matches with the 'name' attribute in the input fields in the form, and the value is whatever is typed in it
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
        navigate("/user-profile");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg p-4">
        <CardHeader>
          <h2 className="text-blue-600 text-2xl font-bold text-center">
            Set Up Your Profile
          </h2>
          <p className="text-gray-500 text-center text-sm mt-2">
            Welcome to Surreal! Don't worry — you can change these later.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
            />
            <Input
              name="age"
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
            />
            <Input
              name="nickname"
              placeholder="Nickname"
              value={formData.nickname}
              onChange={handleChange}
            />
            <Input
              name="course"
              placeholder="Course"
              value={formData.course}
              onChange={handleChange}
            />
            <Input
              name="accomodation"
              placeholder="Accommodation"
              value={formData.accomodation}
              onChange={handleChange}
            />
            <Input
              name="university_year"
              type="number"
              placeholder="University Year"
              value={formData.university_year}
              onChange={handleChange}
            />
            <Input
              name="languages"
              placeholder="Languages"
              value={formData.languages}
              onChange={handleChange}
            />
            <Input
              name="ethnicity"
              placeholder="Ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
            />
            <Input
              name="home_area"
              placeholder="Home Area"
              value={formData.home_area}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col mt-2">
            <label
              htmlFor="bio"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <Button className="mt-4" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save and Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
