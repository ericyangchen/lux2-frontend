import { decodeJwt, isJwtExpired } from "../utils/jwt";
import { useEffect, useRef } from "react";

import { getApplicationCookies } from "../utils/cookie";
import { isPublicRoutes } from "../utils/routes";
import { refreshAccessToken } from "../utils/tokenRefresh";
import { useRouter } from "next/router";

/**
 * Hook to automatically refresh access token in the background
 * Dynamically schedules refresh based on token expiry time
 * Refreshes at 2/3 of token lifetime (e.g., at 10 min for 15 min token)
 */
export const useTokenRefresh = () => {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scheduleRefresh = async () => {
      const isPublicRoute = isPublicRoutes(router.pathname);

      if (isPublicRoute) {
        return;
      }

      const { accessToken } = getApplicationCookies();

      if (!accessToken) {
        return;
      }

      // If already expired, refresh immediately
      if (isJwtExpired(accessToken)) {
        console.log("Token already expired, refreshing now");
        const newToken = await refreshAccessToken();

        if (newToken) {
          // After refresh, schedule next refresh
          scheduleRefresh();
        }
        return;
      }

      // Calculate when to refresh (at 2/3 of token lifetime)
      const decoded = decodeJwt(accessToken);
      if (decoded?.exp && decoded?.iat) {
        const tokenLifetimeMs = (decoded.exp - decoded.iat) * 1000;
        const refreshAtMs = tokenLifetimeMs * (2 / 3);
        const issuedAtMs = decoded.iat * 1000;
        const refreshTime = issuedAtMs + refreshAtMs;
        const now = Date.now();
        const timeUntilRefresh = refreshTime - now;

        if (timeUntilRefresh > 0) {
          console.log(
            `Token refresh scheduled in ${Math.round(
              timeUntilRefresh / 1000 / 60
            )} minutes`
          );

          timeoutRef.current = setTimeout(async () => {
            console.log("Scheduled token refresh triggered");
            const newToken = await refreshAccessToken();

            if (newToken) {
              // After refresh, schedule next refresh
              scheduleRefresh();
            }
          }, timeUntilRefresh);
        } else {
          // Should refresh now
          console.log("Token past refresh threshold, refreshing now");
          const newToken = await refreshAccessToken();

          if (newToken) {
            scheduleRefresh();
          }
        }
      } else {
        // Fallback: check every 1 minute if we can't decode the token
        console.log("Could not decode token, using fallback 1-min interval");
        timeoutRef.current = setTimeout(scheduleRefresh, 60 * 1000);
      }
    };

    scheduleRefresh();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router.pathname]);
};
