import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

// =============================================================================
// BALANCE SUMMARY APIs (for statistics and balance calculations)
// =============================================================================

export const ApiGetAdminBalanceSummary = async ({
  organizationId,
  paymentMethod,
  date,
  accessToken,
}: {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    organizationId,
    paymentMethod,
    date,
  });

  return fetch(
    `${getBackendUrl()}/admin/reports/balance/summary?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetMerchantBalanceSummary = async ({
  organizationId,
  paymentMethod,
  date,
  accessToken,
}: {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    paymentMethod,
    date,
  });

  return fetch(
    `${getBackendUrl()}/organizations/${organizationId}/reports/balance/summary?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

// =============================================================================
// BALANCE TRANSACTIONS APIs (for paginated transaction lists)
// =============================================================================

export const ApiGetAdminBalanceTransactions = async ({
  organizationId,
  paymentMethod,
  date,
  limit,
  cursorSuccessAt,
  cursorId,
  accessToken,
}: {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  limit?: number;
  cursorSuccessAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    organizationId,
    paymentMethod,
    date,
    limit,
    cursorSuccessAt,
    cursorId,
  });

  return fetch(
    `${getBackendUrl()}/admin/reports/balance/transactions?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetMerchantBalanceTransactions = async ({
  organizationId,
  paymentMethod,
  date,
  limit,
  cursorSuccessAt,
  cursorId,
  accessToken,
}: {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  limit?: number;
  cursorSuccessAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    paymentMethod,
    date,
    limit,
    cursorSuccessAt,
    cursorId,
  });

  return fetch(
    `${getBackendUrl()}/organizations/${organizationId}/reports/balance/transactions?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

// =============================================================================
// EXPORT APIs (returns all transactions for Excel export)
// =============================================================================

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
}) => {
  const queryString = buildQueryString({
    organizationId,
    paymentMethod,
    date,
    // Remove pagination parameters for full export
  });

  return fetch(
    `${getBackendUrl()}/admin/reports/balance/export?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

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
}) => {
  const queryString = buildQueryString({
    paymentMethod,
    date,
    // Remove pagination parameters for full export
  });

  return fetch(
    `${getBackendUrl()}/organizations/${organizationId}/reports/balance/export?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
