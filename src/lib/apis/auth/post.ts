import {
  SMPayWebHeader,
  SMPayWebHeaderWithAccessToken,
} from "../smpay-web-header";

import { getBackendUrl } from "@/lib/constants/common";

export const ApiLogin = async ({
  email,
  password,
  totpCode,
}: {
  email: string;
  password: string;
  totpCode?: string;
}) => {
  return fetch(`${getBackendUrl()}/auth/login`, {
    method: "POST",
    headers: SMPayWebHeader(),
    body: JSON.stringify({ email, password, totpCode }),
  });
};

// verify token
export const ApiVerifyToken = async ({ token }: { token: string }) => {
  return fetch(`${getBackendUrl()}/auth/verify-token`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(token),
    body: JSON.stringify({ token }),
  });
};

// refresh access token
export const ApiRefreshToken = async ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  return fetch(`${getBackendUrl()}/auth/refresh`, {
    method: "POST",
    headers: SMPayWebHeader(),
    body: JSON.stringify({ refreshToken }),
  });
};

// logout
export const ApiLogout = async ({
  refreshToken,
  accessToken,
}: {
  refreshToken: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/auth/logout`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ refreshToken }),
  });
};
