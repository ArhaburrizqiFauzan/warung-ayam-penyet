import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type UserRole = 'pemilik' | 'kasir';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = 'http://localhost:5000/api';

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('geprek_token')
  );

  // Auto-restore session saat refresh
  useEffect(() => {
    const savedToken = localStorage.getItem('geprek_token');
    if (savedToken) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.data);
            setToken(savedToken);
          } else {
            localStorage.removeItem('geprek_token');
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('geprek_token');
          setToken(null);
        });
    }
  }, []);

  // Auto logout saat token expired
  useEffect(() => {
    if (!token) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const now = Date.now();
    const timeUntilExpiry = expiry - now;

    if (timeUntilExpiry <= 0) {
      logout();
      toast.error('Sesi telah berakhir, silakan login kembali');
      return;
    }

    const timer = setTimeout(() => {
      logout();
      toast.error('Sesi telah berakhir, silakan login kembali');
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('geprek_token', data.data.token);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('geprek_token');
    localStorage.removeItem('geprek_sessions');
    localStorage.removeItem('geprek_active_session');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
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