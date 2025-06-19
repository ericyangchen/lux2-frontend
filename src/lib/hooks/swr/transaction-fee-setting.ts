import {
  ApiGetOrganizationTransactionFeeSettings,
  ApiGetTransactionFeeSettings,
} from "@/lib/apis/txn-fee-settings/get";

import { ApplicationError } from "@/lib/error/applicationError";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrganizationTransactionFeeSetting } from "@/lib/types/organization-transaction-fee-setting";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { getApplicationCookies } from "@/lib/utils/cookie";
import useSWR from "swr";

const fetchOrganizationTransactionFeeSettings = async ({
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
  const response = await ApiGetOrganizationTransactionFeeSettings({
    organizationId,
    type,
    paymentMethod,
    paymentChannel,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useOrganizationTransactionFeeSettings = ({
  organizationId,
  type,
  paymentMethod,
  paymentChannel,
}: {
  organizationId: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? {
          key: "organization-transaction-fee-settings",
          organizationId,
          type,
          paymentMethod,
          paymentChannel,
          accessToken,
        }
      : null,
    fetchOrganizationTransactionFeeSettings
  );

  return {
    transactionFeeSettings: (data as OrganizationTransactionFeeSetting[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};

const fetchTransactionFeeSettings = async ({
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
  const response = await ApiGetTransactionFeeSettings({
    organizationId,
    orgType,
    type,
    paymentMethod,
    paymentChannel,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useTransactionFeeSettings = ({
  organizationId,
  orgType,
  type,
  paymentMethod,
  paymentChannel,
}: {
  organizationId?: string;
  orgType?: OrgType;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? {
          key: "transaction-fee-settings",
          organizationId,
          orgType,
          type,
          paymentMethod,
          paymentChannel,
          accessToken,
        }
      : null,
    fetchTransactionFeeSettings
  );

  return {
    transactionFeeSettings: (data as OrganizationTransactionFeeSetting[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
