import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiGetTransactionLogsByTransactionId = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/transaction-logs/transactions/${transactionId}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
