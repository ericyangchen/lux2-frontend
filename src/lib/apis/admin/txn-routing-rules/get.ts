import { TxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { SMPayWebHeaderWithAccessToken } from "../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const getTxnRoutingRules = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<TxnRoutingRule[]> => {
  const response = await fetch(`${getBackendUrl()}/txnRoutingRules`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch txn routing rules: ${response.statusText}`
    );
  }

  return response.json();
};
