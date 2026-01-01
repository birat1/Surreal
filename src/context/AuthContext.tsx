//Normally, if you want to share data from a parent to a deeply nested child, you’d need prop drilling: passing props through every intermediate component.
// Context lets you wrap a component tree and provide values that any child can access directly using useContext.
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';

// Define what your context provides
interface AuthContextType {
  userId: string | null;
  userName: string | null;
  profilePicture: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (
    userId: string,
    userName: string,
    profilePicture?: string | null,
    isAdmin?: boolean
  ) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  userId: null,
  userName: null,
  profilePicture: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode; // the type of all the things we're going to wrap AuthProvider with
}

// Provide the context to the app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is logged in via cookie
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/auth/validate-token',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        console.log('Auth Check Response:', data);
        console.log('Profile Picture from backend:', data.profile_picture);

        setUserId(data.user_id);
        setUserName(data.user_name);
        setProfilePicture(data.profile_picture || null);
        setIsAdmin(data.is_admin || false);
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        console.log('Auth check failed, response not ok');
        setUserId(null);
        setUserName(null);
        setProfilePicture(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem('isLoggedIn');
      }
    } catch (error) {
      console.error('Failed auth check:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('isLoggedIn');
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (
    id: string,
    username: string,
    profilePic?: string | null,
    adminStatus?: boolean
  ) => {
    setUserId(id);
    setUserName(username);
    setProfilePicture(profilePic || null);
    setIsAdmin(adminStatus || false);
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        credentials: 'include', // include cookies
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUserId(null);
    setUserName(null);
    // setProfilePicture(null);
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
        profilePicture,
        isAuthenticated: !!userId,
        isLoading,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
