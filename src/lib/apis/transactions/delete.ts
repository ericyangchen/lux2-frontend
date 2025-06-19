import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiDeleteTransaction = async ({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/transactions/${id}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
