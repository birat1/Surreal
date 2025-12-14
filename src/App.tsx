import Home from "@/pages/Home";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import SignUpPage from "@/pages/SignUpPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UserProfilePage from "@/pages/UserProfileSetupPage";
import FriendsFinderPage from "@/pages/FriendsFinderPage";
import MessagesPage from "@/pages/MessagesPage";
import EventsAndSocietiesPage from "@/pages/EventsAndSocietiesPage";
import CreateEventPage from "@/pages/CreateEventPage";

// REMOVE BELOW 2 IMPORTS
import FriendsFinderTempPage from "@/pages/FriendsFinderTempPage";
import FriendsFinderSQLTempPage from "@/pages/FriendsFinderSQLTempPage";

import Navbar from "@/components/Navbar";

import './index.css';

import { Routes, Route, BrowserRouter, useLocation, Navigate } from "react-router-dom";
import RequireLoggedOut from "@/routes/RequireLoggedOut";
import { AuthProvider } from "@/context/AuthContext";


function AppLayout() {
  const location = useLocation();

  const hideNavbarRoutes = ["/404"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <main className={shouldHideNavbar ? "" : "pt-16" }>
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
          
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events-and-societies"
            element={
                <EventsAndSocietiesPage />
            }
          />
          <Route
            path="/create-event"
            element={
                <CreateEventPage />
            }
          />

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace/>} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
