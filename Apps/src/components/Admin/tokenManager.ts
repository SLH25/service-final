/**
 * Token manager: stores the access token in memory (not localStorage)
 * to reduce XSS exposure. The refresh token is stored in localStorage
 * for persistence across page reloads.
 */

let accessToken: string | null = null;
let refreshToken: string | null = localStorage.getItem("adminRefreshToken");

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("adminRefreshToken", refresh);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminUsername");
}