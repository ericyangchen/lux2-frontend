import { OrgTxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { Organization } from "@/lib/types/organization";
import { TxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { SMPayWebHeaderWithAccessToken } from "../../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const getOrgTxnRoutingRules = async ({
  accessToken,
  organizationId,
}: {
  accessToken: string;
  organizationId: string;
}): Promise<OrgTxnRoutingRule[]> => {
  const response = await fetch(
    `${getBackendUrl()}/txnRoutingRules/org/${organizationId}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch org txn routing rules: ${response.statusText}`
    );
  }

  return response.json();
};

// 根據 TxnRoutingRule ID 獲取關聯的組織
export const getOrganizationsByTxnRoutingRuleId = async ({
  accessToken,
  txnRoutingRuleId,
}: {
  accessToken: string;
  txnRoutingRuleId: string;
}): Promise<Organization[]> => {
  const response = await fetch(
    `${getBackendUrl()}/txnRoutingRules/orgs/${txnRoutingRuleId}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch organizations by txn routing rule id: ${response.statusText}`
    );
  }

  return response.json();
};

// 根據 TxnRoutingRule ID 獲取關聯的 OrgTxnRoutingRule 對象（包含 ID 用於批量刪除）
export const getOrgTxnRoutingRulesByTxnRoutingRuleId = async ({
  accessToken,
  txnRoutingRuleId,
}: {
  accessToken: string;
  txnRoutingRuleId: string;
}): Promise<OrgTxnRoutingRule[]> => {
  const response = await fetch(
    `${getBackendUrl()}/txnRoutingRules/org/rule/${txnRoutingRuleId}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch org txn routing rules by txn routing rule id: ${response.statusText}`
    );
  }

  return response.json();
};

// 根據組織 ID 獲取關聯的 TxnRoutingRules
export const getTxnRoutingRulesByOrganizationId = async ({
  accessToken,
  organizationId,
}: {
  accessToken: string;
  organizationId: string;
}): Promise<TxnRoutingRule[]> => {
  const response = await fetch(
    `${getBackendUrl()}/txnRoutingRules/org/${organizationId}/rules`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch txn routing rules by organization id: ${response.statusText}`
    );
  }

  return response.json();
};
