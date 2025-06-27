import { NextRouter, useRouter } from "next/router";
import {
  getOrganizationBaseUrl,
  getOrganizationPrefixUrl,
  isLoginRoutes,
  isPublicRoutes,
} from "../utils/routes";

import { getApplicationCookies } from "../utils/cookie";
import { handleAuthError } from "../utils/auth";
import { useEffect } from "react";
import { useOrganization } from "./swr/organization";

export const useAuthGuard = () => {
  const router = useRouter();

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

  useEffect(() => {
    if (isPublicRoute) {
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
  ]);
};
