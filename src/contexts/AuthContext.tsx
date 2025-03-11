import React, { createContext, useState, useEffect, useMemo } from "react";
import api, { axios } from "../utils/api";
import {
  AuthState,
  LoginCredentials,
  RegisterData,
  User,
  Role,
} from "../types/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        try {
          const storedToken = localStorage.getItem("token");
          
          if (storedToken) {
            setToken(storedToken);
            // Set token in axios instances
            axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            
            // Try to fetch user data
            try {
              const response = await api.get("/api/auth/profile");
              
              if (response.data && response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
              }
            } catch (error: any) {
              console.error("Error fetching user profile:", error);
              // Only clear auth data if it's a 401 error
              if (error.response?.status === 401) {
                clearAuthData();
              }
            }
          }
        } catch (error) {
          console.error("Error during auth initialization:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
    }

    delete axios.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["Authorization"];
  };

  const fetchUser = async () => {
    try {
      const response = await api.get("/api/auth/profile");
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
      
      throw new Error("Invalid user data received");
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      if (error.response?.status === 401) {
        clearAuthData();
      }
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post("/api/auth/login", credentials);
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem("token", newToken);
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      loading,
      login,
      logout,
    }),
    [user, token, isAuthenticated, loading]
  );

  if (loading) {
    return null; // or return a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
