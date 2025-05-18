import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { handleAuthCallback } from "../utils/auth";
import { useUser } from "../contexts/UserContext";
import LoginUI from "./LoginUI";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useUser();
  const processedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (code && !isProcessing && code !== processedCodeRef.current) {
      processedCodeRef.current = code;
      setIsProcessing(true);
      setError(null);
      
      // Handle the auth callback
      handleAuthCallback(code)
        .then(() => {
          console.log("Auth callback successful, getting token...");
          return getToken();
        })
        .then(() => {
          console.log("Token retrieved successfully");
          // Remove the code from URL
          navigate("/", { replace: true });
        })
        .catch((error) => {
          console.error("Authentication failed:", error);
          setError(error instanceof Error ? error.message : "Authentication failed");
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  }, [searchParams, getToken, navigate, isProcessing]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-red-600">
              Authentication Error
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error}
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginUI />;
  }

  return <>{children}</>;
} 