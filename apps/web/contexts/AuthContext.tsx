'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (uniquement côté client)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Vérifier que le token est toujours valide
        authApi.me()
          .then(({ user }) => {
            const adaptedUser = {
              ...user,
              name: user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.email),
            };
            setUser(adaptedUser);
            localStorage.setItem('user', JSON.stringify(adaptedUser));
          })
          .catch(() => {
            // Token invalide, déconnecter
            logout();
          })
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login({ email, password });
    // Adapter le format pour compatibilité
    const adaptedUser = {
      ...user,
      name: user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.email),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(adaptedUser));
    }
    setUser(adaptedUser);
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    const { user, token } = await authApi.register({
      email,
      password,
      firstName,
      lastName,
    });
    // Adapter le format pour compatibilité
    const adaptedUser = {
      ...user,
      name: user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.email),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(adaptedUser));
    }
    setUser(adaptedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
