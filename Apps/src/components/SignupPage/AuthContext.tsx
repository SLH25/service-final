import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { Role } from "../authApi";
import { logoutUser } from "../authApi";

interface StoredUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_staff: boolean;
  [key: string]: unknown;
}

interface AuthContextType {
  user: StoredUser | null;
  userStatus: boolean;
  role: Role | null;
  login: (userData: StoredUser, accessToken?: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
}

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser());

  useEffect(() => {
    const onStorage = () => setUser(readStoredUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(
    (userData: StoredUser, accessToken?: string, refreshToken?: string) => {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
      setUser(userData);
    },
    []
  );

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Ignorer les erreurs réseau : le refresh token est supprimé côté client
      }
    }
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userStatus: !!user,
        role: user?.role ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
