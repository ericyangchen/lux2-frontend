import { BalanceAction } from "@/lib/enums/balances/balance-action.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetOrganizationBalanceRecords = async ({
  organizationId,
  paymentMethod,
  action,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  organizationId?: string;
  paymentMethod?: PaymentMethod;
  action?: BalanceAction;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    organizationId,
    paymentMethod,
    action,
    limit,
    cursorCreatedAt,
    cursorId,
  });

  return fetch(`${getBackendUrl()}/balance-records?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
