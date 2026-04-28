import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AUTH_API_BASE_URL, API_BASE_URL as CORE_API_BASE_URL } from "../config/api";

interface User {
  id?: string;
  username: string;
  email: string;
  wallet_address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string, username: string) => Promise<void>;
  logout: () => void;
  updateWalletAddress: (address: string) => Promise<void>;
  fetchWalletAddress: () => Promise<string | null>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we should use mock auth or real API
const USE_MOCK_AUTH = false; // Changed to always use real API
const API_BASE_URL = AUTH_API_BASE_URL;
const WALLET_API_BASE_URL = CORE_API_BASE_URL;

console.log('=== AUTH CONFIG ===');
console.log('USE_MOCK_AUTH:', USE_MOCK_AUTH);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('WALLET_API_BASE_URL:', WALLET_API_BASE_URL);
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
    // Don't save wallet_address to localStorage - it should only come from MetaMask
    const { wallet_address, ...userWithoutWallet } = user;
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(userWithoutWallet));
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY);
  }
}

function normalizeUser(data: any, fallback?: Partial<User>): User {
  return {
    id: data?.id ?? data?.user_id ?? fallback?.id,
    username: data?.username ?? fallback?.username ?? "",
    email: data?.email ?? fallback?.email ?? "",
  };
}

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  const raw = await response.text();
  if (!raw) return fallback;

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const data = JSON.parse(raw);
      return data.message || data.error || data.detail || fallback;
    } catch {
      return fallback;
    }
  }

  if (contentType.includes('text/html')) {
    return `${fallback} (HTTP ${response.status})`;
  }

  return raw;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up any cached wallet_address from localStorage
    try {
      const stored = localStorage.getItem(MOCK_SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.wallet_address) {
          // Remove wallet_address and resave
          const { wallet_address, ...cleanSession } = session;
          localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(cleanSession));
          console.log('Cleaned up cached wallet_address from localStorage');
        }
      }
    } catch (err) {
      console.error('Error cleaning localStorage:', err);
    }

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
        console.log('Checking authentication at:', `${API_BASE_URL}/me`);
        
        const response = await fetch(`${API_BASE_URL}/me`, {
          credentials: 'include',
        });
        
        console.log('/me response status:', response.status);
        console.log('/me response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data from /me:', data);
          console.log('User ID field:', data.id);
          console.log('User ID field (user_id):', data.user_id);
          console.log('All fields:', Object.keys(data));

          const normalizedUser = normalizeUser(data);
          setUser(normalizedUser);

          // Also save to localStorage as backup (without wallet_address)
          saveSession(normalizedUser);
        } else {
          console.log('/me returned non-OK status:', response.status);
          
          // Try to get user from localStorage as fallback
          const cachedSession = getCurrentSession();
          if (cachedSession) {
            console.log('Using cached session from localStorage:', cachedSession);
            setUser(cachedSession);
          }
        }
      }
    } catch (error) {
      console.log('checkAuth error:', error);
      
      // Try to get user from localStorage as fallback
      const cachedSession = getCurrentSession();
      if (cachedSession) {
        console.log('Using cached session from localStorage after error:', cachedSession);
        setUser(cachedSession);
      }
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

        const userData = normalizeUser(responseData, { username, email });
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
          const errorMessage = await extractErrorMessage(response, 'Registration failed');
          console.log('Error response message:', errorMessage);
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
            const errorMessage = await extractErrorMessage(response, 'Login failed');
            console.log('Error response message:', errorMessage);

            // If user is already logged in, treat it as success
            if (errorMessage.toLowerCase().includes('already logged in')) {
              console.log('User already logged in, fetching user data...');
              await checkAuth();
              return;
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
              
              // If the response contains user data, use it directly
              if (responseData && (responseData.username || responseData.email)) {
                const userData = normalizeUser(responseData, {
                  username: responseData.username || (isEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail),
                  email: responseData.email || (isEmail ? usernameOrEmail : ''),
                });
                console.log('Setting user from login response:', userData);
                setUser(userData);
                saveSession(userData);
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.log('Response is not JSON:', responseText);
            }
          } else {
            console.log('Response body is empty (this is OK for login)');
          }

          // Note: The backend may have cookie issues with SameSite attribute
          // We'll try to fetch user data, and if that fails, we'll use the login credentials
          console.log('Attempting to fetch user data after login...');
          
          try {
            // Fetch user data after successful login
            await checkAuth();
            
            // If checkAuth didn't set a user (due to cookie issues), create one from credentials
            const refreshedSession = getCurrentSession();
            if (!refreshedSession) {
              console.log('checkAuth did not set user, using login credentials as fallback');
              const fallbackUserData = normalizeUser(null, {
                username: isEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail,
                email: isEmail ? usernameOrEmail : '',
              });
              setUser(fallbackUserData);
              saveSession(fallbackUserData);
            }
          } catch (checkAuthError) {
            console.log('checkAuth failed, using login credentials as fallback:', checkAuthError);
            // If /me fails completely, create user data from what we have
            const fallbackUserData = normalizeUser(null, {
              username: isEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail,
              email: isEmail ? usernameOrEmail : '',
            });
            setUser(fallbackUserData);
            saveSession(fallbackUserData);
          }
        } catch (fetchError: any) {
          console.error('Network/Fetch error:', fetchError);
          
          // Check if it's a CORS or network error
          if (fetchError.message?.includes('NetworkError') || fetchError.message?.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to auth API (${API_BASE_URL}). Check proxy/CORS for origin ${window.location.origin}`);
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
        // Real API logout - clear wallet address first using DELETE /address
        try {
          await fetch(`${WALLET_API_BASE_URL}/address`, {
            method: 'DELETE',
            credentials: 'include',
          });
          console.log('Wallet address deleted on logout');
        } catch (err) {
          console.error('Failed to clear wallet on logout:', err);
        }

        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      }

      setUser(null);
      saveSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      saveSession(null);
    }
  };

  const fetchWalletAddress = async (): Promise<string | null> => {
    try {
      if (!user) {
        console.log('Skipping wallet address fetch: user not authenticated');
        return null;
      }

      console.log('Fetching wallet address from:', `${WALLET_API_BASE_URL}/address`);

      const response = await fetch(`${WALLET_API_BASE_URL}/address`, {
        method: 'GET',
        credentials: 'include',
      });

      console.log('Fetch wallet response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No wallet address found');
          return null;
        }
        const errorText = await response.text();
        console.error('Failed to fetch wallet address:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('Wallet address fetched:', data);

      return data.address || null;
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      return null;
    }
  };

  const updateWalletAddress = async (address: string) => {
    try {
      console.log('Updating wallet address:', address);

      if (!address) {
        // If address is empty, delete the wallet address
        const deleteResponse = await fetch(`${WALLET_API_BASE_URL}/address`, {
          method: 'DELETE',
          credentials: 'include',
        });

        console.log('Delete wallet response status:', deleteResponse.status);

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error('Failed to delete wallet address:', errorText);
          throw new Error('Failed to delete wallet address');
        }

        // Update local user state
        if (user) {
          const { wallet_address, ...userWithoutWallet } = user;
          setUser(userWithoutWallet);
          saveSession(userWithoutWallet);
        }

        console.log('Wallet address deleted successfully');
        return;
      }

      // Get current wallet address to check if we need to delete first
      const currentAddress = await fetchWalletAddress();

      // If there's a current address and it's different, delete it first
      if (currentAddress && currentAddress !== address) {
        console.log('Deleting old wallet address before adding new one');
        const deleteResponse = await fetch(`${WALLET_API_BASE_URL}/address`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error('Failed to delete old wallet address:', errorText);
          throw new Error('Failed to delete old wallet address');
        }
      }

      // Post new wallet address
      const response = await fetch(`${WALLET_API_BASE_URL}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          address: address,
        }),
      });

      console.log('Post wallet response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to post wallet address:', errorText);
        throw new Error('Failed to post wallet address');
      }

      // Update local user state
      if (user) {
        const updatedUser = { ...user, wallet_address: address };
        setUser(updatedUser);
        // Don't save wallet_address to localStorage
        const { wallet_address, ...userWithoutWallet } = updatedUser;
        saveSession(userWithoutWallet);
        console.log('Wallet address updated successfully');
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateWalletAddress, fetchWalletAddress, isLoading }}>
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