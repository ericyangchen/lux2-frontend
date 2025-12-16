import { SMPayWebHeaderWithAccessToken } from '../smpay-web-header';
import { getBackendUrl } from '@/lib/constants/common';

export interface ExportTransactionsDto {
  type?: string;
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  status?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  successAtStart?: string;
  successAtEnd?: string;
  amount?: string;
  amountMin?: string;
  amountMax?: string;
}

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

// Admin: Export transactions
export const ApiExportTransactions = async ({
  filters,
  accessToken,
}: {
  filters: ExportTransactionsDto;
  accessToken: string;
}): Promise<Response> => {
  return fetch(`${getBackendUrl()}/transactions/export`, {
    method: 'POST',
    headers: {
      ...SMPayWebHeaderWithAccessToken(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  });
};

// Merchant: Export transactions for specific merchant
export const ApiExportTransactionsByMerchantId = async ({
  merchantId,
  filters,
  accessToken,
}: {
  merchantId: string;
  filters: ExportTransactionsDto;
  accessToken: string;
}): Promise<Response> => {
  return fetch(
    `${getBackendUrl()}/transactions/merchants/${merchantId}/export`,
    {
      method: 'POST',
      headers: {
        ...SMPayWebHeaderWithAccessToken(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    },
  );
};

// Get export job status (Admin)
export const ApiGetExportJobStatus = async ({
  jobId,
  accessToken,
}: {
  jobId: string;
  accessToken: string;
}): Promise<Response> => {
  return fetch(`${getBackendUrl()}/transactions/export/${jobId}/status`, {
    method: 'GET',
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

// Get export job status (Merchant)
export const ApiGetMerchantExportJobStatus = async ({
  merchantId,
  jobId,
  accessToken,
}: {
  merchantId: string;
  jobId: string;
  accessToken: string;
}): Promise<Response> => {
  return fetch(
    `${getBackendUrl()}/transactions/merchants/${merchantId}/export/${jobId}/status`,
    {
      method: 'GET',
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    },
  );
};

// Admin: List transaction exports
export const ApiListTransactionExports = async ({
  accessToken,
  limit,
  offset,
  status,
  merchantId,
}: {
  accessToken: string;
  limit?: number;
  offset?: number;
  status?: string;
  merchantId?: string;
}): Promise<Response> => {
  const queryParams: Record<string, string> = {};
  if (limit) queryParams.limit = limit.toString();
  if (offset) queryParams.offset = offset.toString();
  if (status) queryParams.status = status;
  if (merchantId) queryParams.merchantId = merchantId;

  const queryString = new URLSearchParams(queryParams).toString();

  return fetch(`${getBackendUrl()}/transactions/exports?${queryString}`, {
    method: 'GET',
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

// Merchant: List transaction exports
export const ApiListMerchantTransactionExports = async ({
  merchantId,
  accessToken,
  limit,
  offset,
  status,
}: {
  merchantId: string;
  accessToken: string;
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<Response> => {
  const queryParams: Record<string, string> = {};
  if (limit) queryParams.limit = limit.toString();
  if (offset) queryParams.offset = offset.toString();
  if (status) queryParams.status = status;

  const queryString = new URLSearchParams(queryParams).toString();

  return fetch(
    `${getBackendUrl()}/transactions/merchants/${merchantId}/exports?${queryString}`,
    {
      method: 'GET',
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    },
  );
};

