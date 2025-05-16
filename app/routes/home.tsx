import type { Route } from "./+types/home";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { initiateLogin, handleAuthCallback } from "../utils/auth";
import { useUser } from "../contexts/UserContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - Invoice Dashboard" },
    { name: "description", content: "Login to your invoice dashboard" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, setTokens } = useUser();

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (code) {
      // Handle the auth callback
      handleAuthCallback(code)
        .then((tokens) => {
          setTokens(tokens);
          navigate("/dashboard");
        })
        .catch((error) => {
          console.error("Authentication failed:", error);
          // Handle error appropriately
        });
    } else if (isAuthenticated) {
      // If already authenticated, redirect to dashboard
      navigate("/dashboard");
    }
  }, [searchParams, isAuthenticated, setTokens, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Invoice Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to continue
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={initiateLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with AWS Cognito
          </button>
        </div>
      </div>
    </div>
  );
}
