import React, { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { AuthState, LoginCredentials, RegisterData, User, Role } from "../types/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      // For development purposes, simulate a successful response
      // In production, this would be a real API call
      // const response = await axios.get("/api/auth/me");
      // setUser(response.data);
      
      // Mock user data for development
      const mockUser: User = {
        id: "1",
        username: "test_user",
        email: "test@example.com",
        role: Role.ADMIN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // For development purposes, simulate a successful response
      // In production, this would be a real API call
      // const response = await axios.post("/api/auth/login", credentials);
      // const { token: newToken } = response.data;
      
      // Mock token for development
      const newToken = "mock-jwt-token";
      
      setToken(newToken);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      await fetchUser();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await axios.post("/api/auth/register", data);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
