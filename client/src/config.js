const localApiUrl = 'http://localhost:5000/api';
const configuredApiUrl = import.meta.env.VITE_API_URL || localApiUrl;

export const API_URL = configuredApiUrl.replace(/\/$/, '');
export const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, '')
).replace(/\/$/, '');
