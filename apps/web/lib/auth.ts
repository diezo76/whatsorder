export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  error?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  restaurantName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Utilise les routes API locales de Next.js
export const authApi = {
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    if (!response.ok) {
      throw { response: { data } };
    }
    return data;
  },

  login: async (input: LoginInput): Promise<AuthResponse> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    if (!response.ok) {
      throw { response: { data } };
    }
    return data;
  },

  me: async (): Promise<{ user: User }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw { response: { data } };
    }
    return data;
  },
};
