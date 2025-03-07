import React, { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { AuthState, LoginCredentials, ClinicLoginCredentials, SuperAdminLoginCredentials, User, Role, Clinic } from "../types/auth";

interface AuthContextType extends AuthState {
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
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      // Check if user is a super admin
      const isSuperAdmin = localStorage.getItem("isSuperAdmin") === "true";
      const endpoint = isSuperAdmin ? "/api/super-admin/profile" : "/api/auth/profile";
      
      const response = await axios.get(endpoint);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    }
  };

  const loginAsSuperAdmin = async (credentials: SuperAdminLoginCredentials) => {
    try {
      const response = await axios.post("/api/super-admin/login", credentials);
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      localStorage.setItem("token", newToken);
      localStorage.setItem("isSuperAdmin", "true");
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (error) {
      console.error("Super admin login failed:", error);
      throw error;
    }
  };

  const loginToClinic = async (credentials: ClinicLoginCredentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      localStorage.setItem("token", newToken);
      localStorage.setItem("isSuperAdmin", "false");
      localStorage.setItem("clinicId", credentials.clinicId.toString());
      localStorage.setItem("clinicName", userData.clinicName || "");
      
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
        const response = await axios.get("/api/super-admin/clinics");
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
    
    localStorage.removeItem("token");
    localStorage.removeItem("isSuperAdmin");
    localStorage.removeItem("clinicId");
    localStorage.removeItem("clinicName");
    
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      clinics,
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
