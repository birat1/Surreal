// This is a wrapper component to hide pages that should only be accessible when a user is logged in, it just checks if a jwt token exists in localstorage
// the jwt token is created in the backend in the /login endpoint and is set in the handleLogin method in LoginPage.tsx

import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
