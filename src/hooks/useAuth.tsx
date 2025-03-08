import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import api, { axios } from "../utils/api";
import React, { useEffect } from "react";
import { type Role } from "../types/auth";
interface User {
  id: string;
  username: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => Promise<void>;
  loginAsSuperAdmin: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const authStore = createStore<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(
        `/api/auth/register`,
        data
      );
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || "خطا در ثبت‌نام",
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        `/api/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", token);
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        user,
        token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || "خطا در ورود به سیستم",
        isAuthenticated: false,
      });
      throw error;
    }
  },

  loginAsSuperAdmin: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        `/api/super-admin/login`,
        credentials
      );

      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", token);
        localStorage.setItem("isSuperAdmin", "true");
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        user,
        token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || "خطا در ورود به سیستم",
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("isSuperAdmin");
    }
    delete axios.defaults.headers.common["Authorization"];
    set({
      user: null,
      token: null,
      error: null,
      isAuthenticated: false,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

const useAuth = () => useStore(authStore);

// Initialize auth state on module load
if (typeof window !== 'undefined') {
  // Only run this code in the browser environment
  const token = localStorage.getItem("token");
  if (token) {
    // No need to set axios headers here as it's handled by the api interceptor
    // Fetch user data
    api
      .get(`/api/auth/me`)
      .then((response) => {
        authStore.setState({
          user: response.data,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      })
      .catch(() => {
        authStore.getState().logout();
      });
  }
}

export default useAuth;
