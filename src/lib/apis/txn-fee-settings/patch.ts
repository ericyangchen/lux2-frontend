import { FeeSettingList } from "@/lib/interfaces/txn-fee-settings.interface";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiUpdateTransactionFeeSetting = async ({
  id,
  feeSettingList,
  minAmount,
  maxAmount,
  settlementInterval,
  enabled,
  accessToken,
}: {
  id: string;
  feeSettingList: FeeSettingList;
  minAmount?: string;
  maxAmount?: string;
  settlementInterval?: string;
  enabled?: boolean;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/txn-fee-settings/${id}`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      feeSettingList,
      minAmount,
      maxAmount,
      settlementInterval,
      enabled,
    }),
  });
};
