import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { handleAuthCallback } from "../utils/auth";
import { useUser } from "../contexts/UserContext";
import LoginUI from "./LoginUI";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, setTokens } = useUser();

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (code) {
      // Handle the auth callback
      handleAuthCallback(code)
        .then((tokens) => {
          setTokens(tokens);
        })
        .catch((error) => {
          console.error("Authentication failed:", error);
          // Handle error appropriately
        });
    }
  }, [searchParams, setTokens]);

  if (!isAuthenticated) {
    return <LoginUI />;
  }

  return <>{children}</>;
} 