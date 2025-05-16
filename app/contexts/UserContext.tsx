import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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

  useEffect(() => {
    // Load tokens from secure storage on mount
    const storedTokens = localStorage.getItem('userTokens');
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
        localStorage.removeItem('userTokens');
      }
    }
  }, []);

  const handleSetTokens = (newTokens: UserTokens) => {
    setTokens(newTokens);
    setIsAuthenticated(true);
    // Store tokens in secure storage
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