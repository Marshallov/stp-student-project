export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER';

export interface AuthResponse {
  token: string;
  type: 'Bearer' | string;
  expiresIn: number;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StudentRequest {
  name: string;
  surname: string;
  phone_number: string;
  email: string;
}

export interface StudentUpdateRequest {
  phoneNumber: string;
  email: string;
}

export interface StudentResponse {
  id: number;
  name: string;
  surname: string;
}

export interface StudentFullResponse extends StudentResponse {
  phoneNumber: string | null;
  email: string | null;
}

export interface StudentResponseList {
  response: StudentResponse[];
  totalCount: number;
}

export interface UserRequest {
  email: string;
  password?: string;
  roles: Role[];
}

export interface UserResponse {
  id: number;
  email: string;
  roles: Role[];
}

export interface UserResponseList {
  responses: UserResponse[];
  totalCount: number;
}

export interface AppError {
  statusCode?: number;
  message?: string;
  error?: string;
}

export interface UserSession {
  email: string;
  roles: Role[];
  token: string;
  expiresAt: number;
}
