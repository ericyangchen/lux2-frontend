import {
  PaymentMethodInfo,
  TransactionFeeConfig,
} from "@/lib/types/transaction-fee-config";
import {
  getOrganizationTransactionFeeConfigsApi,
  getPaymentMethodInfoByOrganizationIdApi,
} from "@/lib/apis/organizations/transaction-fee-config";

import { ApplicationError } from "@/lib/types/applicationError";
import { getApplicationCookies } from "@/lib/cookie";
import useSWR from "swr";

const fetchOrganizationTransactionFeeConfigs = async ({
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
  const response = await getOrganizationTransactionFeeConfigsApi({
    organizationId,
    type,
    paymentMethod,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useOrganizationTransactionFeeConfigs = ({
  organizationId,
  type,
  paymentMethod,
}: {
  organizationId?: string;
  type?: string;
  paymentMethod?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? {
          key: "transaction-fee-configs",
          organizationId,
          type,
          paymentMethod,
          accessToken,
        }
      : null,
    fetchOrganizationTransactionFeeConfigs
  );

  return {
    transactionFeeConfigs:
      (data?.transactionFeeConfigs as TransactionFeeConfig[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};

const fetchPaymentMethodInfoByOrganizationIdApi = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await getPaymentMethodInfoByOrganizationIdApi({
    organizationId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useOrganizationPaymentMethodInfo = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? {
          key: "payment-method-infos",
          organizationId,
          accessToken,
        }
      : null,
    fetchPaymentMethodInfoByOrganizationIdApi
  );

  return {
    paymentMethodInfos: data?.paymentMethodInfos as PaymentMethodInfo[],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
