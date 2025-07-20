import {
  UpdateTxnRoutingRuleRequest,
  TxnRoutingRule,
} from "@/lib/types/txn-routing-rule";
import { SMPayWebHeaderWithAccessToken } from "../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const updateTxnRoutingRule = async ({
  accessToken,
  id,
  data,
}: {
  accessToken: string;
  id: string;
  data: UpdateTxnRoutingRuleRequest;
}): Promise<TxnRoutingRule> => {
  const response = await fetch(`${getBackendUrl()}/txnRoutingRules/${id}`, {
    method: "PUT",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to update txn routing rule: ${response.statusText}`
    );
  }

  return response.json();
};
