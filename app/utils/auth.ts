const COGNITO_DOMAIN = 'https://us-west-2rmblxxkdu.auth.us-west-2.amazoncognito.com';
const CLIENT_ID = '338pa180ct0rp50ctcdrfmcepp';
const REDIRECT_URI = import.meta.env.VITE_DEV_ENVIRONMENT === 'true'
  ? 'http://localhost:3000'
  : 'https://invoice.airyvibe.com';
export const initiateLogin = () => {
  const scope = 'email+openid+profile';
  const responseType = 'code';
  const authUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=${responseType}&scope=${scope}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  window.location.href = authUrl;
};

export const handleAuthCallback = async (code: string) => {
  try {
    const tokenEndpoint = `${COGNITO_DOMAIN}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
}; 