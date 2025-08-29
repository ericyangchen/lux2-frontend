import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export interface RequestLog {
  id: string;
  organizationId?: string;
  type: string;
  requestPath: string;
  requestBody?: string;
  responseBody?: string;
  httpStatusCode?: number;
  responseTimeMs?: number;
  responseTimeSec?: number;
  headers?: string;
  createdAt: string;
}

export interface GetRequestLogsParams {
  requestPath?: string;
  responseTimeGt?: number; // in seconds
  createdAtStart?: string;
  createdAtEnd?: string;
  organizationId?: string;
  type?: string;
  httpStatusCode?: number;
  limit?: number;
  offset?: number;
}

export interface GetRequestLogsResponse {
  data: RequestLog[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface GetRequestLogsStatsParams {
  createdAtStart: string;
  createdAtEnd: string;
  timeScale: "1s" | "30s" | "1m" | "10m" | "1h";
  requestPath?: string;
  organizationId?: string;
  type?: string;
}

export interface RequestLogStats {
  timestamp: string;
  avgResponseTimeSec: number;
  count: number;
  minResponseTimeSec: number;
  maxResponseTimeSec: number;
}

export interface GetRequestLogsStatsResponse {
  data: RequestLogStats[];
  timeScale: string;
  filters: {
    createdAtStart: string;
    createdAtEnd: string;
    requestPath?: string;
    organizationId?: string;
    type?: string;
  };
}

export interface FilterOptions {
  requestPaths: string[];
  types: string[];
  timeScales: Array<{
    value: string;
    label: string;
  }>;
}

export interface OverviewStats {
  totalRequests24h: number;
  errorRequests24h: number;
  successRate24h: number;
  period: string;
}

export const ApiGetRequestLogs = async (
  params: GetRequestLogsParams & { accessToken: string }
) => {
  const { accessToken, ...queryParams } = params;
  const queryString = buildQueryString(queryParams);

  return fetch(`${getBackendUrl()}/admin/request-logs?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetRequestLogsStats = async (
  params: GetRequestLogsStatsParams & { accessToken: string }
) => {
  const { accessToken, ...queryParams } = params;
  const queryString = buildQueryString(queryParams);

  return fetch(`${getBackendUrl()}/admin/request-logs/stats?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetRequestLogsFilterOptions = async (accessToken: string) => {
  return fetch(`${getBackendUrl()}/admin/request-logs/filter-options`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetRequestLogsOverview = async (accessToken: string) => {
  return fetch(`${getBackendUrl()}/admin/request-logs/overview`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
