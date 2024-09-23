import { clearApplicationCookies, getApplicationCookies } from "../cookie";
import {
  getOrganizationBaseUrl,
  isLoginRoutes,
  isPublicRoutes,
} from "../routes";

import { useEffect } from "react";
import { useOrganizationInfo } from "./swr/organization";
import { useRouter } from "next/router";

export const useAuthGuard = () => {
  const router = useRouter();

  const { accessToken, userId, organizationId } = getApplicationCookies();

  const hasAccess = !!accessToken && !!userId && !!organizationId;

  const isPublicRoute = isPublicRoutes(router.pathname);
  const isLoginRoute = isLoginRoutes(router.pathname);

  const { organization } = useOrganizationInfo({ organizationId });

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    if (hasAccess) {
      if (isLoginRoute) {
        const organizationBaseUrl = getOrganizationBaseUrl(organization?.type);

        if (organizationBaseUrl) {
          router.push(organizationBaseUrl);
        }
      }
    } else {
      if (!isLoginRoute) {
        router.push("/login");
      }
    }
  }, [isLoginRoute, organization, hasAccess, router, isPublicRoute]);
};
