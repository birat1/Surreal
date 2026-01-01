import '@/index.css';
import {
  Routes,
  Route,
  BrowserRouter,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Navbar from '@/components/Navbar';
import { SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import CreateEventPage from '@/pages/CreateEventPage';
import EditProfilePage from '@/pages/EditProfilePage';
import EventsAndSocietiesPage from '@/pages/EventsAndSocietiesPage';
import FriendsFinderPage from '@/pages/FriendsFinderPage';
import Home from '@/pages/Home';
import LoginPage from '@/pages/LoginPage';
import MessagesPage from '@/pages/MessagesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SignUpPage from '@/pages/SignUpPage';
import UserProfilePage from '@/pages/UserProfileSetupPage';
import AdminRoute from '@/routes/AdminRoute';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RequireLoggedOut from '@/routes/RequireLoggedOut';

function AppLayout() {
  const location = useLocation();

  const hideNavbarRoutes = ['/404'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <main>
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
            path="/events"
            element={
              <ProtectedRoute>
                <EventsAndSocietiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <AdminRoute>
                <CreateEventPage />
              </AdminRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
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
        <SonnerToaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
