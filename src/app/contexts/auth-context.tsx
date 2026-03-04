import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, username: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string, username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (JWT in cookie)
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have a valid session
      const response = await fetch('https://auth.swarmind.ai/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      // Silently fail - user is just not authenticated
      console.log('No active session');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    passwordConfirm: string,
    username: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://auth.swarmind.ai/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          password_confirm: passwordConfirm,
          username,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      setUser({ username, email });
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://auth.swarmind.ai/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed');
      }

      // Login returns a string, so we need to fetch user data
      await checkAuth();
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('https://auth.swarmind.ai/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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