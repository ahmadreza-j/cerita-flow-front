export enum Role {
    ADMIN = 'ADMIN',           // سوپر ادمین
    CLINIC_MANAGER = 'CLINIC_MANAGER', // مدیر مطب
    SECRETARY = 'SECRETARY',    // منشی
    DOCTOR = 'DOCTOR',         // دکتر
    OPTICIAN = 'OPTICIAN',      // عینک‌ساز
    USER = 'USER'
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    username: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: Role;
} 