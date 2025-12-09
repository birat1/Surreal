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
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userId: string, userName: string) => void;
    logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
    userId: null,
    userName: null,
    isAuthenticated: false,
    isLoading: true,
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is logged in via cookie
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/auth/validate-token', {
                method: 'GET',
                credentials: 'include', // include cookies
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserId(data.user_id);
                setUserName(data.user_name);
                setIsAuthenticated(true);
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                setUserId(null);
                setUserName(null);
                setIsAuthenticated(false);
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

    const login = (id: string, username: string) => {
        setUserId(id);
        setUserName(username);
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
    };

    const logout = async () => {
        try {
            await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include', // include cookies
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setUserId(null);
        setUserName(null);
        setIsAuthenticated(false);
        localStorage.removeItem('isLoggedIn');
    };

    return (
        <AuthContext.Provider
            value={{
                userId,
                userName,
                isAuthenticated: !!userId,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
