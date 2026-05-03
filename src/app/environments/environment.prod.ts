export const environment = {
  production: true,
  apiBaseUrl: '/api/listings',
  auth: {
    issuer: 'https://keycloak.fullstackacademy.sk/auth/realms/FSA',
    redirectUri: 'https://poiasniko.fullstackacademy.sk/',
    postLogoutRedirectUri: 'https://poiasniko.fullstackacademy.sk/',
    clientId: 'fsa-client',
    responseType: 'code',
    scope: 'openid profile email',
    showDebugInformation: false
  }
};
