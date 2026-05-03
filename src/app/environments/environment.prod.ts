export const environment = {
  production: true,
  apiBaseUrl: '/api/listings',
  auth: {
    issuer: 'https://poiasniko.20.107.204.3.nip.io/auth/realms/rental',
    redirectUri: 'https://poiasniko.20.107.204.3.nip.io/',
    postLogoutRedirectUri: 'https://poiasniko.20.107.204.3.nip.io/',
    clientId: 'rental-client',
    responseType: 'code',
    scope: 'openid profile email',
    showDebugInformation: false
  }
};
