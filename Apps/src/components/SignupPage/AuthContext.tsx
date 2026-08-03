import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';




interface AuthContextType {
  userStatus: boolean;
  login: (userData: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userStatus, setUserStatus] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in on mount (persist state on refresh)
    const user = localStorage.getItem("user");
    if (user) {
      setUserStatus(true);
    }
  }, []);

  const login = (userData: any) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUserStatus(true);
  };

  const logout = async () => {
   
    try {
      // Attempt to retrieve token from user object or standalone key
      const userStr = localStorage.getItem("user");
      let token = localStorage.getItem("token");
      
      if (!token && userStr) {
        const userData = JSON.parse(userStr);
        token = userData.token || userData.access || userData.key;
      }

      if (token) {
        // Use 127.0.0.1 if on localhost to avoid IPv6 ::1 connection issues
        const apiHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
        await axios.post(`http://${apiHost}:8000/app/auth/logout/`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUserStatus(false);
      
    }
  };

  return (
    <AuthContext.Provider value={{ userStatus, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
