export enum Role {
  ADMIN = "ADMIN", // ادمین
  SECRETARY = "SECRETARY", // منشی
  DOCTOR = "DOCTOR", // دکتر
  OPTICIAN = "OPTICIAN", // عینک‌ساز
}

export interface User {
  id: string;
  username: string;
  email: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: Role;
}
