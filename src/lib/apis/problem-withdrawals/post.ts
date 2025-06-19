import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiHandleProblemWithdrawals = async ({
  transactionIds,
  newPaymentChannel,
  accessToken,
}: {
  transactionIds: string[];
  newPaymentChannel: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/problem-withdrawals/handle`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ transactionIds, newPaymentChannel }),
  });
};
