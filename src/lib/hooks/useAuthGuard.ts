import { NextRouter, useRouter } from "next/router";
import {
  getOrganizationBaseUrl,
  getOrganizationPrefixUrl,
  isLoginRoutes,
  isPublicRoutes,
} from "../utils/routes";
import { useEffect, useState } from "react";

import { getApplicationCookies } from "../utils/cookie";
import { handleAuthError } from "../utils/auth";
import { isJwtExpired } from "../utils/jwt";
import { refreshAccessToken } from "../utils/tokenRefresh";
import { useOrganization } from "./swr/organization";

export const useAuthGuard = () => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const { accessToken, userId, organizationId } = getApplicationCookies();

  const hasAccess = !!accessToken && !!userId && !!organizationId;

  const isPublicRoute = isPublicRoutes(router.pathname);
  const isLoginRoute = isLoginRoutes(router.pathname);

  // Don't fetch organization for public routes
  const { organization, isLoading: isOrganizationLoading } = useOrganization({
    organizationId: isPublicRoute ? undefined : organizationId,
  });

  const organizationPrefixUrl = getOrganizationPrefixUrl(organization?.type);
  const organizationBaseUrl = getOrganizationBaseUrl(organization?.type);

  // Proactively refresh token on page load if expired
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (isPublicRoute || !accessToken) {
        return;
      }

      // Check if access token is expired
      if (isJwtExpired(accessToken)) {
        console.log("Access token expired, refreshing...");
        setIsCheckingAuth(true);

        const newToken = await refreshAccessToken();

        setIsCheckingAuth(false);

        if (!newToken) {
          console.log("Failed to refresh token, logging out");
          handleAuthError(router);
        } else {
          console.log("Token refreshed successfully");
        }
      }
    };

    checkAndRefreshToken();
  }, [accessToken, isPublicRoute, router]);

  useEffect(() => {
    if (isPublicRoute || isCheckingAuth) {
      return;
    }

    // redirect to login if no access
    if (!hasAccess && !isLoginRoute) {
      console.log("!hasAccess && !isLoginRoute");
      handleAuthError(router);
      return;
    }

    if (isOrganizationLoading) {
      console.log("isLoading");
      return;
    }

    // handle login route
    if (isLoginRoute) {
      if (organizationBaseUrl) {
        console.log("isLoginRoute, organizationBaseUrl");
        router.push(organizationBaseUrl);
      }

      return;
    }

    // cannot get organization
    if (!organizationBaseUrl || !organizationPrefixUrl) {
      console.log("!organizationBaseUrl || !organizationPrefixUrl");
      handleAuthError(router);
      return;
    }

    // handle organization route prefix
    if (!router.pathname.startsWith(organizationPrefixUrl)) {
      console.log("!router.pathname.startsWith(organizationPrefixUrl)");
      router.push(organizationBaseUrl);

      return;
    }
  }, [
    isLoginRoute,
    organization,
    hasAccess,
    router,
    isPublicRoute,
    organizationBaseUrl,
    organizationPrefixUrl,
    isOrganizationLoading,
    isCheckingAuth,
  ]);
};
