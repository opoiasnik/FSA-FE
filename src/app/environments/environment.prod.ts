export const environment = {
  production: true,
  apiBaseUrl: '/api/listings',
  auth: {
    issuer: 'https://poiasniko.20.107.204.3.nip.io/auth/realms/FSA',
    redirectUri: 'https://poiasniko.20.107.204.3.nip.io/',
    postLogoutRedirectUri: 'https://poiasniko.20.107.204.3.nip.io/',
    clientId: 'fsa-client',
    responseType: 'code',
    scope: 'openid profile email',
    showDebugInformation: false
  }
};
