const COGNITO_DOMAIN = 'https://us-west-2rmblxxkdu.auth.us-west-2.amazoncognito.com';
const CLIENT_ID = '338pa180ct0rp50ctcdrfmcepp';
const CLIENT_SECRET = import.meta.env.VITE_INVOICE_DASHBOARD_USERPOOL_CLIENT_SECRET as string;
const REDIRECT_URI = import.meta.env.VITE_DEV_ENVIRONMENT === 'true'
  ? 'http://localhost:3000'
  : 'https://invoice.airyvibe.com';

// OAuth endpoints
const DISCOVERY_DOCUMENT = {
  authorizationEndpoint: `${COGNITO_DOMAIN}/oauth2/authorize`,
  tokenEndpoint: `${COGNITO_DOMAIN}/oauth2/token`,
  revocationEndpoint: `${COGNITO_DOMAIN}/oauth2/revoke`,
};

// Constants for token storage
const ID_TOKEN_KEY = 'ID_TOKEN';
const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';
const EXPIRE_AT_MS_KEY = 'AUTH_EXPIRE_AT_MS';

// Constants for token expiration
const S_TO_MS = 1000;
const TOKEN_EXPIRE_SAFE_TIME_MS = 60000; // 1 minute safety margin

interface TokenPayload {
  exp: number;
  sub: string;
  email?: string;
  [key: string]: any;
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
}

export const parseJwt = (token: string): TokenPayload => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    throw new Error('Invalid token format');
  }
};

export const saveTokens = async (tokenResponse: TokenResponse) => {
  if (!tokenResponse.id_token || !tokenResponse.access_token || !tokenResponse.expires_in) {
    throw new Error('Missing required tokens');
  }

  try {
    // Validate tokens before saving
    parseJwt(tokenResponse.id_token);
    parseJwt(tokenResponse.access_token);

    // Save tokens to localStorage and log for testing
    console.log('Saving ID token:', tokenResponse.id_token);
    localStorage.setItem(ID_TOKEN_KEY, tokenResponse.id_token);
    
    console.log('Saving access token:', tokenResponse.access_token); 
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
    
    if (tokenResponse.refresh_token) {
      console.log('Saving refresh token:', tokenResponse.refresh_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    }

    // Calculate and save expiration time with safety margin
    let expireTime = Date.now() + tokenResponse.expires_in * S_TO_MS;
    if (tokenResponse.expires_in > 2 * TOKEN_EXPIRE_SAFE_TIME_MS) {
      expireTime -= TOKEN_EXPIRE_SAFE_TIME_MS;
    }
    localStorage.setItem(EXPIRE_AT_MS_KEY, expireTime.toString());
  } catch (error) {
    console.error('Error saving tokens:', error);
    clearTokens();
    throw new Error('Failed to save tokens: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const isTokenExpired = (): boolean => {
  const expireAtMs = localStorage.getItem(EXPIRE_AT_MS_KEY);
  if (!expireAtMs) return true;
  return Date.now() >= parseInt(expireAtMs);
};

export const refreshTokens = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    });

    const response = await fetch(DISCOVERY_DOCUMENT.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error_description || 'Failed to refresh tokens');
    }

    const tokens = await response.json();
    await saveTokens(tokens);
    return tokens;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    clearTokens();
    throw error;
  }
};

export const initiateLogin = () => {
  const scope = 'email+openid+profile';
  const responseType = 'code';
  const authUrl = `${DISCOVERY_DOCUMENT.authorizationEndpoint}?client_id=${CLIENT_ID}&response_type=${responseType}&scope=${scope}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  window.location.href = authUrl;
};

const exchangeTokensWithCognito = async (code: string) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
  });

  const response = await fetch(DISCOVERY_DOCUMENT.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Token exchange failed:', errorData);
    throw new Error(`Failed to exchange code for tokens: ${errorData.error_description || errorData.error || 'Unknown error'}`);
  }

  return response.json();
};

const exchangeTokensWithAPI = async (code: string) => {
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Token exchange failed:', errorData);
    throw new Error(`Failed to exchange code for tokens: ${errorData.message || 'Unknown error'}`);
  }

  return response.json();
};

export const handleAuthCallback = async (code: string) => {
  try {
    console.log('Exchanging code for tokens...');
    
    const tokens = import.meta.env.VITE_DEV_ENVIRONMENT === 'true'
      ? await exchangeTokensWithCognito(code)
      : await exchangeTokensWithAPI(code);

    console.log('Token exchange successful, saving tokens...');
    await saveTokens(tokens);
    return tokens;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    clearTokens();
    throw error;
  }
};

export const clearTokens = () => {
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRE_AT_MS_KEY);
};

/**
 * Retrieves an authentication token from secure storage.
 * If the token is expired, it will automatically refresh it.
 * If no token exists, it will return null.
 *
 * @param tokenType - The type of token to retrieve ('accessToken' or 'idToken', defaults to 'accessToken')
 * @returns Promise resolving to the requested token string, or null if retrieval fails
 */
export const getAccessToken = async (tokenType: 'accessToken' | 'idToken' = 'accessToken'): Promise<string | null> => {
  const tokenKey = tokenType === 'accessToken' ? ACCESS_TOKEN_KEY : ID_TOKEN_KEY;
  const token = localStorage.getItem(tokenKey);
  if (!token) return null;

  if (isTokenExpired()) {
    try {
      await refreshTokens();
      return localStorage.getItem(tokenKey);
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearTokens();
      return null;
    }
  }

  return token;
};