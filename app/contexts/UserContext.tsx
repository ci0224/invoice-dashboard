import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAccessToken, clearTokens } from '../utils/auth';

interface UserContextType {
  isAuthenticated: boolean;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const token = await getAccessToken();
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  const getToken = async (): Promise<string | null> => {
    const token = await getAccessToken();
    setIsAuthenticated(!!token);
    return token;
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, logout, getToken }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 