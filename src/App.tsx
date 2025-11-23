import Home from "@/components/Home";
import LoginPage from "@/components/LoginPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import SignUpPage from "@/components/SignUpPage";
import UserProfilePage from "@/components/UserProfileSetupPage";
import FriendsFinderPage from "./components/FriendsFinderPage";
import Navbar from "./components/Navbar";

import "./index.css";

import { Routes, Route, BrowserRouter } from "react-router-dom";
import RequireLoggedOut from "./routes/RequireLoggedOut";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/signup"
            element={
              <RequireLoggedOut>
                <SignUpPage />
              </RequireLoggedOut>
            }
          />
          <Route
            path="/login"
            element={
              <RequireLoggedOut>
                <LoginPage />
              </RequireLoggedOut>
            }
          />

          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends-finder"
            element={
              <ProtectedRoute>
                <FriendsFinderPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
