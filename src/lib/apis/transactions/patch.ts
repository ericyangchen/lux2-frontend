import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiUpdateTransactionNote = async ({
  id,
  note,
  accessToken,
}: {
  id: string;
  note: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/transactions/${id}/note`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ note }),
  });
};
