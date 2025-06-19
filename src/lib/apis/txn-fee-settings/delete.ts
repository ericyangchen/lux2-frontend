import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiDeleteTransactionFeeSetting = async ({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/txn-fee-settings/${id}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
