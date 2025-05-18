import type { Route } from "./+types/home";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Invoice Dashboard" },
    { name: "description", content: "Your invoice dashboard" },
  ];
}

export default function Home() {
  const { getToken } = useUser();
  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    idToken: string | null;
    refreshToken: string | null;
  }>({
    accessToken: null,
    idToken: null,
    refreshToken: null,
  });

  useEffect(() => {
    const fetchTokens = async () => {
      const accessToken = await getToken();
      const idToken = localStorage.getItem('ID_TOKEN');
      const refreshToken = localStorage.getItem('REFRESH_TOKEN');
      
      setTokens({
        accessToken,
        idToken,
        refreshToken,
      });
    };
    fetchTokens();
  }, [getToken]);

  const TokenDisplay = ({ label, value }: { label: string; value: string | null }) => (
    <div className="mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-2">{label}</h3>
      <div className="bg-gray-100 p-4 rounded">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {value || "Not available"}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Token Information</h2>
          <div className="space-y-4">
            <TokenDisplay label="Access Token" value={tokens.accessToken} />
            <TokenDisplay label="ID Token" value={tokens.idToken} />
            <TokenDisplay label="Refresh Token" value={tokens.refreshToken} />
          </div>
        </div>
      </div>
    </div>
  );
}
