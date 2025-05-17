import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { isTokenExpired, refreshTokens } from '../utils/auth';

interface UserTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

interface UserContextType {
  isAuthenticated: boolean;
  tokens: UserTokens | null;
  setTokens: (tokens: UserTokens) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<UserTokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validateAndRefreshTokens = useCallback(async (currentTokens: UserTokens) => {
    try {
      // Check if access token is expired
      if (isTokenExpired(currentTokens.accessToken)) {
        // If access token is expired, try to refresh
        const newTokens = await refreshTokens(currentTokens.refreshToken);
        setTokens(newTokens);
        localStorage.setItem('userTokens', JSON.stringify(newTokens));
        return newTokens;
      }
      return currentTokens;
    } catch (error) {
      console.error('Error validating/refreshing tokens:', error);
      // If refresh fails, logout
      setTokens(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userTokens');
      return null;
    }
  }, []);

  useEffect(() => {
    // Load tokens from storage on mount
    const storedTokens = localStorage.getItem('userTokens');
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        // Validate and refresh if needed
        validateAndRefreshTokens(parsedTokens).then((validTokens) => {
          if (validTokens) {
            setTokens(validTokens);
            setIsAuthenticated(true);
          }
        });
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
        localStorage.removeItem('userTokens');
      }
    }
  }, [validateAndRefreshTokens]);

  // Set up periodic token validation
  useEffect(() => {
    if (!tokens) return;

    const validateInterval = setInterval(() => {
      validateAndRefreshTokens(tokens);
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(validateInterval);
  }, [tokens, validateAndRefreshTokens]);

  const handleSetTokens = (newTokens: UserTokens) => {
    setTokens(newTokens);
    setIsAuthenticated(true);
    localStorage.setItem('userTokens', JSON.stringify(newTokens));
  };

  const logout = () => {
    setTokens(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userTokens');
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, tokens, setTokens: handleSetTokens, logout }}>
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