import { ApiGetUpstreamBalances } from "@/lib/apis/upstream-balances/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";
import { USE_BALANCES_REFRESH_INTERVAL } from "../../constants/swr-refresh-interval";

export interface UpstreamBalance {
  balance: number | null;
  lastUpdated: string;
  error?: string;
}

const fetchUpstreamBalances = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const response = await ApiGetUpstreamBalances({
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();
    const error = new ApplicationError(errorData);
    throw error;
  }

  return response.json();
};

export const useUpstreamBalances = () => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "upstreamBalances", accessToken } : null,
    fetchUpstreamBalances,
    { refreshInterval: USE_BALANCES_REFRESH_INTERVAL }
  );

  return {
    upstreamBalances: (data as Record<string, UpstreamBalance>) || {},
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};


