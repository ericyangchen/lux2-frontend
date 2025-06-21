import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetOrganizationTransactionFeeSettings = async ({
  organizationId,
  type,
  paymentMethod,
  paymentChannel,
  accessToken,
}: {
  organizationId: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    type,
    paymentMethod,
    paymentChannel,
  });

  return fetch(
    `${getBackendUrl()}/organizations/${organizationId}/txn-fee-settings?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetTransactionFeeSettings = async ({
  organizationId,
  orgType,
  type,
  paymentMethod,
  paymentChannel,
  accessToken,
}: {
  organizationId?: string;
  orgType?: OrgType;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    organizationId,
    orgType,
    type,
    paymentMethod,
    paymentChannel,
  });

  return fetch(`${getBackendUrl()}/txn-fee-settings?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
