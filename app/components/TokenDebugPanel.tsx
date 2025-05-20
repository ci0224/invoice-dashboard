import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { DebugPanel, DebugItem } from "./DebugPanel";
import { getUsername } from "../utils/auth";

export function TokenDebugPanel() {
  const { getToken } = useUser();
  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    idToken: string | null;
    refreshToken: string | null;
    username: string | null;
  }>({
    accessToken: null,
    idToken: null,
    refreshToken: null,
    username: null,
  });

  useEffect(() => {
    const fetchTokens = async () => {
      const accessToken = await getToken();
      const idToken = localStorage.getItem('ID_TOKEN');
      const refreshToken = localStorage.getItem('REFRESH_TOKEN');
      const username = await getUsername();
      
      setTokens({
        accessToken,
        idToken,
        refreshToken,
        username,
      });
    };
    fetchTokens();
  }, [getToken]);

  return (
    <DebugPanel title="Token Information">
      <DebugItem label="Username" value={tokens.username} />
      <DebugItem label="Access Token" value={tokens.accessToken} />
      <DebugItem label="ID Token" value={tokens.idToken} />
      <DebugItem label="Refresh Token" value={tokens.refreshToken} />
    </DebugPanel>
  );
} 