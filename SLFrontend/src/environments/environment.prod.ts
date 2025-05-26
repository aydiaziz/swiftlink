console.log(">>> PROD ENVIRONMENT LOADED <<<");

export const environment = {
  production: true,
  apiUrl: 'http://localhost:8001/api',
  chatUrl: ''
};
console.log("API URL:", environment.apiUrl);