import { FeeSettingList } from "@/lib/interfaces/txn-fee-settings.interface";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
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
  return fetch(`${getBackendUrl()}/txn-fee-settings/${id}`, {
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
