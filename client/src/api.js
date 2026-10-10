const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = isLocalDevelopment
  ? 'http://localhost:5000'
  : 'https://aviator-game-pro.onrender.com';

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
