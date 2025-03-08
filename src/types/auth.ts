export enum Role {
  ADMIN = "ADMIN", // سوپر ادمین
  CLINIC_MANAGER = "CLINIC_MANAGER", // مدیر کلینیک
  SECRETARY = "SECRETARY", // منشی
  DOCTOR = "DOCTOR", // دکتر
  OPTICIAN = "OPTICIAN", // عینک‌ساز
  USER = "USER",
}

export interface User {
  id: string;
  username: string;
  email: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  clinicId?: number;
  clinicName?: string;
  isSuperAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Clinic {
  id: number;
  name: string;
  dbName: string;
  address?: string;
  phone?: string;
  managerName?: string;
  establishmentYear?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  clinics: Clinic[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SuperAdminLoginCredentials extends LoginCredentials {
  // No additional fields needed for super admin login
}

export interface ClinicLoginCredentials extends LoginCredentials {
  clinicId: number;
}

export interface RegisterData extends LoginCredentials {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: Role;
  clinicId?: number;
}
