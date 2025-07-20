import { TxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { getTxnRoutingRules } from "@/lib/apis/admin/txn-routing-rules/get";
import { useSwrWithAuth } from "../useSwrWithAuth";
import { getApplicationCookies } from "@/lib/utils/cookie";

const fetchTxnRoutingRules = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return getTxnRoutingRules({ accessToken });
};

export const useTxnRoutingRules = () => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = !!accessToken;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "txn-routing-rules", accessToken } : null,
    fetchTxnRoutingRules
  );

  return {
    txnRoutingRules: data as TxnRoutingRule[],
    isLoading,
    isError: error,
    mutate,
  };
};
