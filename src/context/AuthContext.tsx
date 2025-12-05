//Normally, if you want to share data from a parent to a deeply nested child, you’d need prop drilling: passing props through every intermediate component.
// Context lets you wrap a component tree and provide values that any child can access directly using useContext.

import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  exp?: number;
}

// Define what your context provides
interface AuthContextType {
  token: string | null;
  userId: string | null;
  userName: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  userName: null,
  login: () => {},
  logout: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode; // the type of all the things we're going to wrap AuthProvider with
}

// Provide the context to the app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const getUserDataFromToken = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return {
        id: decoded.sub,
        name: decoded.name,
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };
 

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("jwt_token");
    if (savedToken) {
      const data = getUserDataFromToken(savedToken);
      
      if (data) {
        setToken(savedToken);
        setUserId(data.id);
        setUserName(data.name);
      } else {
        localStorage.removeItem("jwt_token");
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("jwt_token", newToken);
    setToken(newToken);
    
    const data = getUserDataFromToken(newToken);
    if (data) {
      setUserId(data.id);
      setUserName(data.name);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    setUserId(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, userName,login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
