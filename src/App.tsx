import Home from "@/components/Home";
import LoginPage from "@/components/LoginPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignUpPage from "@/components/SignUpPage";
import UserProfilePage from "@/components/UserProfileSetupPage";

import "./index.css"

import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage/>} />


        <Route path="/user-profile" element={<ProtectedRoute><UserProfilePage/></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
