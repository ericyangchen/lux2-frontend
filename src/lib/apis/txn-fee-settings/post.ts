import { FeeSettingList } from "@/lib/interfaces/txn-fee-settings.interface";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { backendUrl } from "@/lib/constants/common";

export const ApiCreateTransactionFeeSetting = async ({
  organizationId,
  orgType,
  type,
  paymentMethod,
  paymentChannel,
  feeSettingList,
  minAmount,
  maxAmount,
  settlementInterval,
  enabled,
  accessToken,
}: {
  organizationId: string;
  orgType: OrgType;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  paymentChannel: PaymentChannel;
  feeSettingList: FeeSettingList;
  minAmount?: string;
  maxAmount?: string;
  settlementInterval?: string;
  enabled?: boolean;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/txn-fee-settings`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      orgType,
      type,
      paymentMethod,
      paymentChannel,
      feeSettingList,
      minAmount,
      maxAmount,
      settlementInterval,
      enabled,
    }),
  });
};
