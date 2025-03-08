import React, { createContext, useState, useEffect, useMemo } from "react";
import api, { axios } from "../utils/api";
import {
  AuthState,
  LoginCredentials,
  ClinicLoginCredentials,
  SuperAdminLoginCredentials,
  User,
  Role,
  Clinic,
} from "../types/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginAsSuperAdmin: (credentials: SuperAdminLoginCredentials) => Promise<void>;
  loginToClinic: (credentials: ClinicLoginCredentials) => Promise<void>;
  logout: () => void;
  getClinics: () => Promise<Clinic[]>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        // Set token in both axios instances
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        fetchUser();
      }
    }
  }, []);

  const fetchUser = async () => {
    try {
      // Check if user is a super admin
      const isSuperAdmin = localStorage.getItem("isSuperAdmin") === "true";
      const endpoint = isSuperAdmin
        ? "/api/super-admin/profile"
        : "/api/auth/profile";

      const response = await api.get(endpoint);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
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
        localStorage.setItem("isSuperAdmin", "false");
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginAsSuperAdmin = async (credentials: SuperAdminLoginCredentials) => {
    try {
      const response = await api.post("/api/super-admin/login", credentials);
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem("token", newToken);
        localStorage.setItem("isSuperAdmin", "true");
      }
      
      // Update the default axios headers for other axios calls
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (error) {
      console.error("Super admin login failed:", error);
      throw error;
    }
  };

  const loginToClinic = async (credentials: ClinicLoginCredentials) => {
    try {
      const response = await api.post("/api/auth/login", credentials);
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem("token", newToken);
        localStorage.setItem("isSuperAdmin", "false");
        localStorage.setItem("clinicId", credentials.clinicId.toString());
        localStorage.setItem("clinicName", userData.clinicName || "");
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (error) {
      console.error("Clinic login failed:", error);
      throw error;
    }
  };

  const getClinics = async (): Promise<Clinic[]> => {
    try {
      // Only fetch clinics if we're a super admin
      if (user?.isSuperAdmin) {
        const response = await api.get("/api/super-admin/clinics");
        setClinics(response.data.clinics);
        return response.data.clinics;
      }
      return clinics;
    } catch (error) {
      console.error("Failed to fetch clinics:", error);
      return [];
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setClinics([]);

    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("isSuperAdmin");
      localStorage.removeItem("clinicId");
      localStorage.removeItem("clinicName");
    }

    delete axios.defaults.headers.common["Authorization"];
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      clinics,
      login,
      loginAsSuperAdmin,
      loginToClinic,
      logout,
      getClinics,
    }),
    [user, token, isAuthenticated, clinics]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
