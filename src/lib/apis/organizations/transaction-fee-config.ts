import { PaymentMethod } from "@/lib/types/transaction";
import { backendUrl } from "@/lib/constants";

export const getOrganizationTransactionFeeConfigsApi = async ({
  organizationId,
  type,
  paymentMethod,
  accessToken,
}: {
  organizationId: string;
  type?: string;
  paymentMethod?: string;
  accessToken: string;
}) => {
  const query = new URLSearchParams();
  if (type) query.append("type", type);
  if (paymentMethod) query.append("paymentMethod", paymentMethod);

  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/transaction-fee-configs?${query.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface ChannelSettings {
  paymentChannel: string;
  minAmount?: string;
  maxAmount?: string;
  settlementInterval?: string;
  enabled?: boolean;
}

export const createOrganizationTransactionFeeConfigsWithSamePaymentMethod =
  async ({
    organizationId,
    type,
    paymentMethod,
    percentageFee,
    fixedFee,
    channelSettings,
    accessToken,
  }: {
    organizationId: string;
    type: string;
    paymentMethod: PaymentMethod;
    percentageFee: string;
    fixedFee: string;
    channelSettings: ChannelSettings[];
    accessToken: string;
  }) => {
    const url = `${backendUrl}/organizations/${encodeURIComponent(
      organizationId
    )}/transaction-fee-configs/same-paymentMethod`;

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type,
        paymentMethod,
        percentageFee,
        fixedFee,
        channelSettings,
      }),
    });
  };

export const updateOrganizationTransactionFeeConfigsWithSamePaymentMethod =
  async ({
    organizationId,
    type,
    paymentMethod,
    percentageFee,
    fixedFee,
    channelSettings,
    accessToken,
  }: {
    organizationId: string;
    type: string;
    paymentMethod: PaymentMethod;
    percentageFee: string;
    fixedFee: string;
    channelSettings: ChannelSettings[];
    accessToken: string;
  }) => {
    const url = `${backendUrl}/organizations/${encodeURIComponent(
      organizationId
    )}/transaction-fee-configs/same-paymentMethod`;

    return fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type,
        paymentMethod,
        percentageFee,
        fixedFee,
        channelSettings,
      }),
    });
  };

export const getPaymentMethodInfoByOrganizationIdApi = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/transaction-fee-configs/payment-method-infos`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
