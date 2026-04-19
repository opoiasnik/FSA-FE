export const environment = {
  production: false,
  apiBaseUrl: '/api/listings',
  auth: {
    issuer: 'http://localhost:8081/realms/rental',
    redirectUri: 'http://localhost:4200/',
    postLogoutRedirectUri: 'http://localhost:4200/',
    clientId: 'rental-client',
    responseType: 'code',
    scope: 'openid profile email',
    showDebugInformation: true
  }
};
