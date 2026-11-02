import { api } from './client';
import type {
  AuthResponse, LoginRequest, StudentFullResponse, StudentRequest,
  StudentResponse, StudentResponseList, StudentUpdateRequest, UserRequest,
  UserResponse, UserResponseList,
} from '../types';

export const authApi = {
  login: (payload: LoginRequest, signal?: AbortSignal) =>
    api.post<AuthResponse>('/auth/login', payload, { signal }).then((res) => res.data),
};

export const studentsApi = {
  list: (signal?: AbortSignal) =>
    api.get<StudentResponseList>('/student', { signal }).then((res) => res.data),
  get: (id: number, signal?: AbortSignal) =>
    api.get<StudentFullResponse>(`/student/${id}`, { signal }).then((res) => res.data),
  create: (payload: StudentRequest) =>
    api.post<StudentResponse>('/student/save', payload).then((res) => res.data),
  update: (id: number, payload: StudentUpdateRequest) =>
    api.put<StudentResponse>(`/student/${id}`, payload).then((res) => res.data),
  remove: (id: number) => api.delete(`/student/${id}`),
};

export const usersApi = {
  list: (signal?: AbortSignal) =>
    api.get<UserResponseList>('/users', { signal }).then((res) => res.data),
  create: (payload: UserRequest) =>
    api.post<UserResponse>('/users/save', payload).then((res) => res.data),
  update: (id: number, payload: UserRequest) =>
    api.put<UserResponse>(`/users/${id}`, payload).then((res) => res.data),
  remove: (id: number) => api.delete(`/users/${id}`),
};
