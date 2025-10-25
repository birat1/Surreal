import { Card, CardHeader, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";

const SignUpPage = () => {
  const [formData, setFormData] = useState({    //initial form field values are empty
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {  // this function updates the value of the formData state (which is an object) as the user types into the form field
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {    // this function sends the formData to the backend via post request
    e.preventDefault()  // doesn't refresh the page when form is submitted
    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log("Response from backend", data)
    }
    catch (error) {
      console.error("Error submitting form", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-blue-500 text-2xl font-bold text-center">
            Sign Up
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <Input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
            />
            <Input
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="Nickname"
            />
            <Input
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
            />
            <Input
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Course"
            />
            <Input
              name="accomodation"
              value={formData.accomodation}
              onChange={handleChange}
              placeholder="Accommodation Type"
            />
            <Input
              name="university_year"
              type="number"
              value={formData.university_year}
              onChange={handleChange}
              placeholder="Year"
            />
            <Input
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="Languages"
            />
            <Input
              name="ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
              placeholder="Ethnicity"
            />
            <Input
              name="home_area"
              value={formData.home_area}
              onChange={handleChange}
              placeholder="Home Area"
            />

            <Button type="submit" onSubmit={handleSubmit} className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
