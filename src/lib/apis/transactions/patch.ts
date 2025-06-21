import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiUpdateTransactionNote = async ({
  id,
  note,
  accessToken,
}: {
  id: string;
  note: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/transactions/${id}/note`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ note }),
  });
};
