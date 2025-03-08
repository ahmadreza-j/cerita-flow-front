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
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        try {
          const storedToken = localStorage.getItem("token");
          const isSuperAdmin = localStorage.getItem("isSuperAdmin") === "true";
          
          if (storedToken) {
            setToken(storedToken);
            // Set token in axios instances
            axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            
            // Try to fetch user data
            try {
              const endpoint = isSuperAdmin ? "/api/super-admin/profile" : "/api/auth/profile";
              const response = await api.get(endpoint);
              
              if (response.data && response.data.user) {
                const userData = {
                  ...response.data.user,
                  isSuperAdmin
                };
                setUser(userData);
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
    setClinics([]);

    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("isSuperAdmin");
      localStorage.removeItem("clinicId");
      localStorage.removeItem("clinicName");
    }

    delete axios.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["Authorization"];
  };

  const fetchUser = async (isSuperAdmin?: boolean) => {
    try {
      if (typeof isSuperAdmin === 'undefined') {
        isSuperAdmin = localStorage.getItem("isSuperAdmin") === "true";
      }
      
      const endpoint = isSuperAdmin ? "/api/super-admin/profile" : "/api/auth/profile";
      const response = await api.get(endpoint);
      
      if (response.data && response.data.user) {
        const userData = {
          ...response.data.user,
          isSuperAdmin
        };
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
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
      // Clear any previous auth data first
      localStorage.removeItem("token");
      localStorage.removeItem("isSuperAdmin");
      localStorage.removeItem("clinicId");
      localStorage.removeItem("clinicName");
      delete axios.defaults.headers.common["Authorization"];
      delete api.defaults.headers.common["Authorization"];
      
      // Attempt login
      const response = await api.post("/api/super-admin/login", credentials);
      
      if (!response.data || !response.data.token) {
        throw new Error("Invalid response from server");
      }
      
      const { token, user: userData } = response.data;

      // Set the token in localStorage first
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", token);
        localStorage.setItem("isSuperAdmin", "true");
      }
      
      // Set token in axios instances
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setToken(token);
      setUser({ ...userData, isSuperAdmin: true });
      setIsAuthenticated(true);

      console.log("Super admin login successful, token set:", token.substring(0, 10) + "...");
      
      return userData;
    } catch (error) {
      console.error("Super admin login failed:", error);
      clearAuthData();
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
    clearAuthData();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      clinics,
      loading,
      login,
      loginAsSuperAdmin,
      loginToClinic,
      logout,
      getClinics,
    }),
    [user, token, isAuthenticated, clinics, loading]
  );

  if (loading) {
    return null; // or return a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
