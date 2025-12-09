// This is a wrapper component to hide pages that shouldn't be accessible when a user is not logged in, it just checks if a jwt token exists in localstorage
// the jwt token is created in the backend in the /login endpoint and is set in the handleLogin method in LoginPage.tsx

import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
