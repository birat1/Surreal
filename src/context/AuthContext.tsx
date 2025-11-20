//Normally, if you want to share data from a parent to a deeply nested child, you’d need prop drilling: passing props through every intermediate component.
// Context lets you wrap a component tree and provide values that any child can access directly using useContext.

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";


// Define what your context provides
interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context
export const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode; // the type of all the things we're going to wrap AuthProvider with
}

// Provide the context to the app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
 

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("jwt_token");
    if (savedToken) setToken(savedToken);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("jwt_token", newToken);
    setToken(newToken);
    
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
   
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
