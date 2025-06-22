import useSWR, { SWRConfiguration, SWRResponse } from "swr";

import { ApplicationError } from "../error/applicationError";
import { handleAuthError } from "../utils/auth";
import { useEffect } from "react";
import { useRouter } from "next/router";

export function useSwrWithAuth<T>(
  key: any,
  fetcher: ((key: any) => Promise<T>) | null,
  config?: SWRConfiguration
): SWRResponse<T, ApplicationError> {
  const router = useRouter();

  const swrResponse = useSWR<T, ApplicationError>(key, fetcher, config);

  // Handle auth errors automatically
  useEffect(() => {
    if (swrResponse.error?.isAuthError) {
      handleAuthError(router);
    }
  }, [swrResponse.error, router]);

  return swrResponse;
}
