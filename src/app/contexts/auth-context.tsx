import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string, username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we should use mock auth or real API
const USE_MOCK_AUTH = false; // Changed to always use real API
const API_BASE_URL = 'https://auth.swarmind.ai';

console.log('=== AUTH CONFIG ===');
console.log('USE_MOCK_AUTH:', USE_MOCK_AUTH);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('==================');

// Mock user database for prototype
const MOCK_USERS_KEY = 'anthive_mock_users';
const MOCK_SESSION_KEY = 'anthive_mock_session';

function getMockUsers() {
  const stored = localStorage.getItem(MOCK_USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveMockUsers(users: any[]) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function getCurrentSession() {
  const stored = localStorage.getItem(MOCK_SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

function saveSession(user: User | null) {
  if (user) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock: Check localStorage session
        await new Promise(resolve => setTimeout(resolve, 300));
        const session = getCurrentSession();
        if (session) {
          setUser(session);
        }
      } else {
        // Real API: Check /me endpoint
        const response = await fetch(`${API_BASE_URL}/me`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      }
    } catch (error) {
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
      if (USE_MOCK_AUTH) {
        // Mock registration
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = getMockUsers();
        
        if (users.find((u: any) => u.email === email || u.username === username)) {
          throw new Error('User already exists');
        }

        if (password !== passwordConfirm) {
          throw new Error('Passwords do not match');
        }

        const newUser = { username, email, password };
        users.push(newUser);
        saveMockUsers(users);

        const userData = { username, email };
        setUser(userData);
        saveSession(userData);
      } else {
        // Real API registration
        console.log('Making registration request to:', `${API_BASE_URL}/register`);
        console.log('Request payload:', {
          email,
          password: '***',
          password_confirm: '***',
          username,
        });
        
        const response = await fetch(`${API_BASE_URL}/register`, {
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

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          let errorMessage = 'Registration failed';
          try {
            const errorData = await response.json();
            console.log('Error response:', errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            const textError = await response.text();
            console.log('Error response (text):', textError);
            if (textError) errorMessage = textError;
          }
          throw new Error(errorMessage);
        }

        // Try to parse response, handle empty responses
        let responseData = null;
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
            console.log('Registration response (parsed):', responseData);
          } catch (e) {
            console.log('Response is not JSON:', responseText);
          }
        } else {
          console.log('Response body is empty (this is OK)');
        }

        const userData = { username, email };
        setUser(userData);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      if (USE_MOCK_AUTH) {
        // Mock login
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = getMockUsers();
        const user = users.find((u: any) => 
          u.username === usernameOrEmail || u.email === usernameOrEmail
        );

        if (!user || user.password !== password) {
          throw new Error('Invalid username/email or password');
        }

        const userData = { username: user.username, email: user.email };
        setUser(userData);
        saveSession(userData);
      } else {
        // Real API login
        const isEmail = usernameOrEmail.includes('@');
        
        console.log('Making login request to:', `${API_BASE_URL}/login`);
        console.log('Request payload:', {
          email: isEmail ? usernameOrEmail : undefined,
          username: !isEmail ? usernameOrEmail : undefined,
          password: '***',
        });
        
        try {
          const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              email: isEmail ? usernameOrEmail : undefined,
              username: !isEmail ? usernameOrEmail : undefined,
              password,
            }),
          });

          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);

          if (!response.ok) {
            let errorMessage = 'Login failed';
            try {
              const errorData = await response.json();
              console.log('Error response:', errorData);
              errorMessage = errorData.message || errorData.error || errorMessage;
              
              // If user is already logged in, treat it as success
              if (errorMessage.includes('already logged in')) {
                console.log('User already logged in, fetching user data...');
                await checkAuth();
                return;
              }
            } catch (e) {
              const textError = await response.text();
              console.log('Error response (text):', textError);
              if (textError) {
                errorMessage = textError;
                // Check text response too
                if (errorMessage.includes('already logged in')) {
                  console.log('User already logged in, fetching user data...');
                  await checkAuth();
                  return;
                }
              }
            }
            throw new Error(errorMessage);
          }

          // Try to parse response, handle empty responses
          let responseData = null;
          const responseText = await response.text();
          console.log('Response text:', responseText);
          
          if (responseText) {
            try {
              responseData = JSON.parse(responseText);
              console.log('Login response (parsed):', responseData);
            } catch (e) {
              console.log('Response is not JSON:', responseText);
            }
          } else {
            console.log('Response body is empty (this is OK for login)');
          }

          // Fetch user data after successful login
          await checkAuth();
        } catch (fetchError: any) {
          console.error('Network/Fetch error:', fetchError);
          
          // Check if it's a CORS or network error
          if (fetchError.message?.includes('NetworkError') || fetchError.message?.includes('Failed to fetch')) {
            throw new Error('Cannot connect to auth.swarmind.ai - CORS may not be configured correctly. Make sure the backend allows requests from ' + window.location.origin);
          }
          
          throw fetchError;
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock logout
        await new Promise(resolve => setTimeout(resolve, 200));
        saveSession(null);
      } else {
        // Real API logout
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      }
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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