import api from './api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  firstName?: string | null; // Pour compatibilité avec le frontend
  lastName?: string | null;  // Pour compatibilité avec le frontend
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', input);
    return response.data;
  },

  login: async (input: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', input);
    return response.data;
  },

  me: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },
};
