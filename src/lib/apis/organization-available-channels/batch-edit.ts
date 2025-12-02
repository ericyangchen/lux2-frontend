import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";

export interface OrganizationChannelStatus {
  organizationId: string;
  organizationName: string;
  organizationType: string;
  level: number;
  parentId?: string;
  channelStatus: "enabled" | "disabled" | "not_created";
  feeSettings?: Array<{
    percentage: string;
    fixed: string;
  }>;
  isAvailable: boolean;
}

export interface OrganizationChannelUpdate {
  organizationId: string;
  action: "enable" | "disable";
}

export const ApiGetBatchEditData = async ({
  transactionType,
  paymentMethod,
  paymentChannel,
  accessToken,
}: {
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  paymentChannel: PaymentChannel;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/organization-available-channels/batch-edit/${transactionType}/${paymentMethod}/${paymentChannel}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiCheckWarnings = async ({
  transactionType,
  paymentMethod,
  paymentChannel,
  updates,
  accessToken,
}: {
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  paymentChannel: PaymentChannel;
  updates: OrganizationChannelUpdate[];
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/organization-available-channels/check-warnings`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      transactionType,
      paymentMethod,
      paymentChannel,
      updates,
    }),
  });
};

export const ApiBatchUpdateChannels = async ({
  transactionType,
  paymentMethod,
  paymentChannel,
  updates,
  accessToken,
}: {
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  paymentChannel: PaymentChannel;
  updates: OrganizationChannelUpdate[];
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/organization-available-channels/batch-update`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      transactionType,
      paymentMethod,
      paymentChannel,
      updates,
    }),
  });
};

