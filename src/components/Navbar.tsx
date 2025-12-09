import { Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

import surreyLogo from '../assets/surrey_logo.jpg';

import { Button } from './ui/button';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md shadow-md z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link
                    className="text-2xl font-extrabold text-blue-600 hover:text-blue-700 transition"
                    to="/"
                >
                    <img
                        src={surreyLogo}
                        alt="University of Surrey logo"
                        className="h-10 w-auto hover:opacity-90 transition"
                    />
                </Link>

                {isAuthenticated && (
                    <div className="flex items-center gap-6">
                        <Link
                            to="/friends-finder"
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                        >
                            <Users className="w-5 h-5" />
                            <span>Friends Finder</span>
                        </Link>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            // If logged in → show Logout
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        ) : (
                            // If NOT logged in => show Login + Signup
                            <>
                                <Link to="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>

                                <Link to="/signup">
                                    <Button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg cursor-pointer">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
