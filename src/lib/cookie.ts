import Cookies from "js-cookie";

export const APPLICATION_USER_ID_COOKIE = "userId";
export const APPLICATION_ORGANIZATION_ID_COOKIE = "organizationId";
export const APPLICATION_TOKEN_COOKIE = "accessToken";

export const setApplicationCookies = ({
  userId,
  organizationId,
  accessToken,
}: {
  userId: string;
  organizationId: string;
  accessToken: string;
}) => {
  Cookies.set(APPLICATION_USER_ID_COOKIE, userId);
  Cookies.set(APPLICATION_ORGANIZATION_ID_COOKIE, organizationId);

  Cookies.set(APPLICATION_TOKEN_COOKIE, accessToken, {
    path: "/",
    // expires: 1, // 1 day expiration
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
};

export const getApplicationCookies = () => {
  return {
    accessToken: Cookies.get(APPLICATION_TOKEN_COOKIE),
    userId: Cookies.get(APPLICATION_USER_ID_COOKIE),
    organizationId: Cookies.get(APPLICATION_ORGANIZATION_ID_COOKIE),
  };
};

export const clearApplicationCookies = () => {
  Cookies.remove(APPLICATION_USER_ID_COOKIE);
  Cookies.remove(APPLICATION_ORGANIZATION_ID_COOKIE);
  Cookies.remove(APPLICATION_TOKEN_COOKIE);
};
