import { TxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { SMPayWebHeaderWithAccessToken } from "../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const deleteTxnRoutingRule = async ({
  accessToken,
  id,
}: {
  accessToken: string;
  id: string;
}): Promise<TxnRoutingRule> => {
  const response = await fetch(`${getBackendUrl()}/txnRoutingRules/${id}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to delete txn routing rule: ${response.statusText}`
    );
  }

  return response.json();
};
