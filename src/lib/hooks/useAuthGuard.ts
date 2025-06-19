import { NextRouter, useRouter } from "next/router";
import {
  clearApplicationCookies,
  getApplicationCookies,
} from "../utils/cookie";
import {
  getOrganizationBaseUrl,
  getOrganizationPrefixUrl,
  isLoginRoutes,
  isPublicRoutes,
} from "../utils/routes";

import { useEffect } from "react";
import { useOrganization } from "./swr/organization";

const clearAndRedirectToLogin = (router: NextRouter) => {
  clearApplicationCookies();
  router.push("/login");
};

export const useAuthGuard = () => {
  const router = useRouter();

  const { accessToken, userId, organizationId } = getApplicationCookies();

  const hasAccess = !!accessToken && !!userId && !!organizationId;

  const isPublicRoute = isPublicRoutes(router.pathname);
  const isLoginRoute = isLoginRoutes(router.pathname);

  const { organization, isLoading } = useOrganization({ organizationId });

  const organizationPrefixUrl = getOrganizationPrefixUrl(organization?.type);
  const organizationBaseUrl = getOrganizationBaseUrl(organization?.type);

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    // redirect to login if no access
    if (!hasAccess && !isLoginRoute) {
      console.log("!hasAccess && !isLoginRoute");
      clearAndRedirectToLogin(router);
      return;
    }

    // loading organization
    if (isLoading) {
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
      clearAndRedirectToLogin(router);
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
    isLoading,
    organizationBaseUrl,
    organizationPrefixUrl,
  ]);
};
