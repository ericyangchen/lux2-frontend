import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiApproveMerchantRequestedWithdrawal = async ({
  transactionIds,
  adminNote,
  accessToken,
}: {
  transactionIds: string[];
  adminNote?: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/merchant-requested-withdrawal/approve`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ transactionIds, adminNote }),
  });
};

export const ApiRejectMerchantRequestedWithdrawal = async ({
  transactionIds,
  rejectionReason,
  accessToken,
}: {
  transactionIds: string[];
  rejectionReason?: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/merchant-requested-withdrawal/reject`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ transactionIds, rejectionReason }),
  });
};
