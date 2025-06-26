import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiDeleteTransactionFeeSetting = async ({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/txn-fee-settings/${id}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
