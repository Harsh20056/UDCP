// Reads VITE_ environment variables and exposes them in a single place.
// Change VITE_USE_MOCK to false in .env to hit the real backend.

export const ENV = {
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false', // default true
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  MAP_TILE_URL: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  IS_DEV: import.meta.env.DEV,
};
