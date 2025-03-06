import create from 'zustand';
import axios from 'axios';

interface User {
    id: string;
    username: string;
    role: 'doctor' | 'secretary' | 'optician';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const useAuth = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                username,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            
            set({
                user,
                token,
                isLoading: false,
                error: null
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.error || 'خطا در ورود به سیستم'
            });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({
            user: null,
            token: null,
            error: null
        });
    },

    clearError: () => {
        set({ error: null });
    }
}));

export default useAuth; 