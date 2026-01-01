// This is a wrapper to hide pages that should not be accessible by the user when they are logged in (opposite of the ProtectedRoute.tsx file)
// examples are login/signup pages
import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

interface RequireLoggedOutProps {
  children: JSX.Element;
}

const RequireLoggedOut = ({ children }: RequireLoggedOutProps) => {
  const { isAuthenticated, isLoading, userName } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    if (userName === 'New User' || userName === 'Unknown') {
      return <Navigate to="/user-profile" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireLoggedOut;
