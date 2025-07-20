import { OrgTxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { getOrgTxnRoutingRules } from "@/lib/apis/admin/txn-routing-rules/org/get";
import { useSwrWithAuth } from "../useSwrWithAuth";
import { getApplicationCookies } from "@/lib/utils/cookie";

const fetchOrgTxnRoutingRules = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return getOrgTxnRoutingRules({ organizationId, accessToken });
};

export const useOrgTxnRoutingRules = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch
      ? { key: "org-txn-routing-rules", organizationId, accessToken }
      : null,
    fetchOrgTxnRoutingRules
  );

  return {
    orgTxnRoutingRules: data as OrgTxnRoutingRule[],
    isLoading,
    isError: error,
    mutate,
  };
};
