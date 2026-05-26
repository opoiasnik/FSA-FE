export const environment = {
  production: true,
  apiUrl: '/api',
  auth: {
    issuer: 'https://rent-area.com/auth/realms/rental',
    redirectUri: 'https://rent-area.com/',
    postLogoutRedirectUri: 'https://rent-area.com/',
    clientId: 'rental-client',
    responseType: 'code',
    scope: 'openid profile email',
    showDebugInformation: false
  }
};
