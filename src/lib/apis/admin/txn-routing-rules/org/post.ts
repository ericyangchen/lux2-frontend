import {
  CreateOrgTxnRoutingRuleRequest,
  OrgTxnRoutingRule,
} from "@/lib/types/txn-routing-rule";
import { SMPayWebHeaderWithAccessToken } from "../../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const createOrgTxnRoutingRule = async ({
  accessToken,
  data,
}: {
  accessToken: string;
  data: CreateOrgTxnRoutingRuleRequest;
}): Promise<OrgTxnRoutingRule[]> => {
  const response = await fetch(`${getBackendUrl()}/txnRoutingRules/org`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to create org txn routing rule: ${response.statusText}`
    );
  }

  return response.json();
};
