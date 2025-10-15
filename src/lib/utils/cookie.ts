import Cookies from "js-cookie";
import { getEnvironment } from "../constants/common";

export const APPLICATION_USER_ID_COOKIE = "userId";
export const APPLICATION_ORGANIZATION_ID_COOKIE = "organizationId";
export const APPLICATION_TOKEN_COOKIE = "accessToken";
export const APPLICATION_REFRESH_TOKEN_COOKIE = "refreshToken";

export const setApplicationCookies = ({
  userId,
  organizationId,
  accessToken,
  refreshToken,
}: {
  userId: string;
  organizationId: string;
  accessToken: string;
  refreshToken?: string;
}) => {
  // Set user info cookies with same expiry as refresh token for consistency
  Cookies.set(APPLICATION_USER_ID_COOKIE, userId, {
    path: "/",
    expires: 7,
    secure: getEnvironment() === "production",
    sameSite: "Strict",
  });

  Cookies.set(APPLICATION_ORGANIZATION_ID_COOKIE, organizationId, {
    path: "/",
    expires: 7,
    secure: getEnvironment() === "production",
    sameSite: "Strict",
  });

  // Access token cookie - persist across sessions, will be refreshed automatically
  Cookies.set(APPLICATION_TOKEN_COOKIE, accessToken, {
    path: "/",
    expires: 7, // Match refresh token expiry
    secure: getEnvironment() === "production",
    sameSite: "Strict",
  });

  if (refreshToken) {
    Cookies.set(APPLICATION_REFRESH_TOKEN_COOKIE, refreshToken, {
      path: "/",
      expires: 7, // 7 days expiration
      secure: getEnvironment() === "production",
      sameSite: "Strict",
    });
  }
};

export const getApplicationCookies = () => {
  return {
    accessToken: Cookies.get(APPLICATION_TOKEN_COOKIE),
    refreshToken: Cookies.get(APPLICATION_REFRESH_TOKEN_COOKIE),
    userId: Cookies.get(APPLICATION_USER_ID_COOKIE),
    organizationId: Cookies.get(APPLICATION_ORGANIZATION_ID_COOKIE),
  };
};

export const clearApplicationCookies = () => {
  Cookies.remove(APPLICATION_USER_ID_COOKIE);
  Cookies.remove(APPLICATION_ORGANIZATION_ID_COOKIE);
  Cookies.remove(APPLICATION_TOKEN_COOKIE);
  Cookies.remove(APPLICATION_REFRESH_TOKEN_COOKIE);
};
