import { ApiGetTransactionLogsByTransactionId } from "@/lib/apis/txn-logs/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { TransactionLog } from "@/lib/types/transaction-log";
import { getApplicationCookies } from "@/lib/utils/cookie";
import useSWR from "swr";

const fetchTransactionLogsByTransactionId = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  const response = await ApiGetTransactionLogsByTransactionId({
    transactionId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useTransactionLogs = ({
  transactionId,
}: {
  transactionId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && transactionId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? { key: "transaction-logs", transactionId, accessToken }
      : null,
    fetchTransactionLogsByTransactionId,
    { refreshInterval: 0 } // No auto-refresh for logs
  );

  return {
    transactionLogs: (data as TransactionLog[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
