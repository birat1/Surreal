// This is a wrapper to hide pages that should not be accessible by the user when they are logged in (opposite of the ProtectedRoute.tsx file)
// examples are login/signup pages

import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface RequireLoggedOutProps {
    children: JSX.Element
}

const RequireLoggedOut = ({ children }: RequireLoggedOutProps) => {
  const token = localStorage.getItem("jwt_token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireLoggedOut;

