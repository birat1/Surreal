import { User, Users, Inbox, Newspaper, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

import defaultProfile from '../assets/default_profile.jpeg';

import NotificationBell from './NotificationBell';
import { Button } from './ui/button';
import surreyLogo from '/Surreal_favicon.ico';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, profilePicture } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Navbar - Profile Picture:', profilePicture);

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  const handleProfilebutton = () => {
    navigate('/edit-profile');
  };

  let profilePictureSrc = defaultProfile;

  if (profilePicture && typeof profilePicture === 'string') {
    const pic = profilePicture.trim();

    console.log('Processing profile picture:', pic);

    if (pic && pic.startsWith('http')) {
      profilePictureSrc = pic;
      console.log('Using S3 URL:', profilePictureSrc);
    } else {
      console.log('Profile picture does not start with http:', pic);
    }
  } else {
    console.log('No profile picture or invalid type');
  }

  const navbarItems = [
    { label: 'Friends', href: '/friends-finder', icon: Users },
    {
      label: 'Events & Societies',
      href: '/events',
      icon: Newspaper,
    },
    { label: 'Inbox', href: '/messages', icon: Inbox },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-7xl rounded-2xl border border-blue-100 bg-blue-50/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between px-7 py-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 transition-transform hover:scale-105"
          >
            <img
              src={surreyLogo}
              alt="Surreal Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg">Surreal</span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-1">
              {navbarItems.map(({ label, href, icon: Icon }) => {
                const active = location.pathname.startsWith(href);
                return (
                  <Link
                    key={label}
                    to={href}
                    className={`
                                            flex items-center gap-2
                                            rounded-lg px-3 py-1.5 text-sm font-medium
                                            transition
                                            ${
                                              active
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }
                                        `}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationProvider>
                  <NotificationBell />
                </NotificationProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-9 w-9 rounded-full overflow-hidden bg-gray-200 p-0">
                      <img
                        src={profilePictureSrc}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <DropdownMenuItem
                      onClick={handleProfilebutton}
                      className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100"
                    >
                      <User size={16} />
                      Profile
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
                                                    text-red-600 hover:bg-red-50 focus:text-red-600"
                    >
                      <LogOut size={16} />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-500 text-white transition-transform hover:scale-105">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
