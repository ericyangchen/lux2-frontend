import {
  DeleteOrgTxnRoutingRuleRequest,
  OrgTxnRoutingRule,
} from "@/lib/types/txn-routing-rule";
import { SMPayWebHeaderWithAccessToken } from "../../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

// 單個刪除函數
export const deleteOrgTxnRoutingRule = async ({
  accessToken,
  id,
}: {
  accessToken: string;
  id: string;
}): Promise<OrgTxnRoutingRule> => {
  const response = await fetch(`${getBackendUrl()}/txnRoutingRules/org/${id}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to delete org txn routing rule: ${response.statusText}`
    );
  }

  return response.json();
};

// 批量刪除函數 - 使用後端支援的批量刪除端點
export const deleteOrgTxnRoutingRules = async ({
  accessToken,
  data,
}: {
  accessToken: string;
  data: DeleteOrgTxnRoutingRuleRequest;
}): Promise<OrgTxnRoutingRule[]> => {
  const response = await fetch(`${getBackendUrl()}/txnRoutingRules/org`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to delete org txn routing rules: ${response.statusText}`
    );
  }

  return response.json();
};
