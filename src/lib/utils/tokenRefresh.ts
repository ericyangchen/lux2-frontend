import { ApiLogout, ApiRefreshToken } from "../apis/auth/post";
import {
  clearApplicationCookies,
  getApplicationCookies,
  setApplicationCookies,
} from "./cookie";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the access token using the refresh token
 * Returns the new access token or null if refresh failed
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const { refreshToken, userId, organizationId } = getApplicationCookies();

      if (!refreshToken || !userId || !organizationId) {
        return null;
      }

      const response = await ApiRefreshToken({ refreshToken });

      if (!response.ok) {
        // Refresh token is invalid or expired, clear everything
        clearApplicationCookies();
        return null;
      }

      const data = await response.json();
      const { accessToken } = data;

      if (!accessToken) {
        clearApplicationCookies();
        return null;
      }

      // Update the access token in cookies
      setApplicationCookies({
        userId,
        organizationId,
        accessToken,
        refreshToken,
      });

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearApplicationCookies();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Logout and revoke refresh token
 */
export const logout = async (): Promise<void> => {
  const { refreshToken, accessToken } = getApplicationCookies();

  if (refreshToken && accessToken) {
    try {
      await ApiLogout({ refreshToken, accessToken });
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  }

  clearApplicationCookies();
};
