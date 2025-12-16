import { PaymentMethod } from '@/lib/enums/transactions/payment-method.enum';
import { SMPayWebHeaderWithAccessToken } from '../smpay-web-header';
import { buildQueryString } from '@/lib/utils/build-query-string';
import { getBackendUrl } from '@/lib/constants/common';

export interface ExportJobResponse {
  success: boolean;
  jobId: string;
  status: string;
  message: string;
}

export interface JobStatus {
  jobId: string;
  userId: string;
  organizationId: string;
  jobType: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  progressMessage: string | null;
  gcsUrl: string | null;
  error: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string | undefined;
  completedAt: string | null;
}

export interface ExportListResponse {
  jobs: JobStatus[];
  total: number;
}

// Admin: Export balance report (single date only) - now returns job ID
export const ApiExportAdminBalanceReport = async ({
  organizationId,
  paymentMethod,
  date,
  accessToken,
}: {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  accessToken: string;
}): Promise<Response> => {
  const queryString = buildQueryString({
    organizationId,
    paymentMethod,
    date,
  });

  return fetch(
    `${getBackendUrl()}/admin/reports/balance/export?${queryString}`,
    {
      method: 'GET',
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    },
  );
};

// Merchant: Export balance report (single date only) - now returns job ID
export const ApiExportMerchantBalanceReport = async ({
  organizationId,
  paymentMethod,
  date,
  accessToken,
}: {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  accessToken: string;
}): Promise<Response> => {
  const queryString = buildQueryString({
    paymentMethod,
    date,
  });

  return fetch(
    `${getBackendUrl()}/organizations/${organizationId}/reports/balance/export?${queryString}`,
    {
      method: 'GET',
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    },
  );
};

// Get balance report export job status
export const ApiGetBalanceReportJobStatus = async ({
  jobId,
  accessToken,
  organizationId,
  isAdmin = false,
}: {
  jobId: string;
  accessToken: string;
  organizationId?: string;
  isAdmin?: boolean;
}): Promise<Response> => {
  const url = isAdmin
    ? `${getBackendUrl()}/admin/reports/balance/export/${jobId}/status`
    : `${getBackendUrl()}/organizations/${organizationId}/reports/balance/export/${jobId}/status`;

  return fetch(url, {
    method: 'GET',
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

// Admin: List balance report exports
export const ApiListAdminBalanceReportExports = async ({
  accessToken,
  limit,
  offset,
  status,
}: {
  accessToken: string;
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<Response> => {
  const queryString = buildQueryString({
    limit: limit?.toString(),
    offset: offset?.toString(),
    status,
  });

  return fetch(
    `${getBackendUrl()}/admin/reports/balance/exports?${queryString}`,
    {
      method: 'GET',
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    },
  );
};

// Merchant: List balance report exports
export const ApiListMerchantBalanceReportExports = async ({
  organizationId,
  accessToken,
  limit,
  offset,
  status,
}: {
  organizationId: string;
  accessToken: string;
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<Response> => {
  const queryString = buildQueryString({
    limit: limit?.toString(),
    offset: offset?.toString(),
    status,
  });

  return fetch(
    `${getBackendUrl()}/organizations/${organizationId}/reports/balance/exports?${queryString}`,
    {
      method: 'GET',
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    },
  );
};

