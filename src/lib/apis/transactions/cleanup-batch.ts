import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiCleanupTransactionsBatch = async ({
  transactionIds,
  accessToken,
}: {
  transactionIds: string[];
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/transactions/cleanup/batch`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ transactionIds }),
  });
};

