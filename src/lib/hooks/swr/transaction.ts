import { ApplicationError } from "@/lib/types/applicationError";
import { Transaction } from "@/lib/types/transaction";
import { USE_TRANSACTION_REFRESH_INTERVAL } from "./constants";
import { getApplicationCookies } from "@/lib/cookie";
import { getTransactionByIdApi } from "@/lib/apis/transactions";
import useSWR from "swr";

const fetchTransactionById = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  const response = await getTransactionByIdApi({
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

export const useTransaction = ({
  transactionId,
}: {
  transactionId: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && transactionId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "transaction", transactionId, accessToken } : null,
    fetchTransactionById,
    { refreshInterval: USE_TRANSACTION_REFRESH_INTERVAL }
  );

  return {
    transaction: data?.transaction as Transaction,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
