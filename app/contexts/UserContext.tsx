import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAccessToken, clearTokens } from '../utils/auth';

interface UserContextType {
  isAuthenticated: boolean;
  logout: () => void;
  /**
   * Retrieves an authentication token from secure storage.
   * If the token is expired, it will automatically refresh it.
   * If no token exists, it will trigger the login flow.
   *
   * @param tokenType - The type of token to retrieve ('accessToken' or 'idToken', defaults to 'idToken')
   * @returns Promise resolving to the requested token string, or null if retrieval fails
   */
  getToken: (tokenType?: 'accessToken' | 'idToken') => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const token = await getAccessToken('accessToken');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  const getToken = async (tokenType: 'accessToken' | 'idToken' = 'idToken'): Promise<string | null> => {
    const token = await getAccessToken(tokenType);
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