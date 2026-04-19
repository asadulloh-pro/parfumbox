/**
 * Same-origin API in dev (via Vite proxy) avoids mixed-content failures when the
 * admin UI is opened over HTTPS (e.g. ngrok) while the API is HTTP localhost.
 */
export function getParfumApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return '/_parfumbox-api';
  return 'http://localhost:3000';
}
