import { ApplicationError } from "@/lib/types/applicationError";
import { TransactionMetadata } from "@/lib/types/transaction-metadata";
import { USE_TRANSACTION_METADATA_REFRESH_INTERVAL } from "./constants";
import { getApplicationCookies } from "@/lib/cookie";
import { getTransactionMetadataByIdApi } from "@/lib/apis/transaction-metadata";
import useSWR from "swr";

const fetchTransactionMetadataById = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  const response = await getTransactionMetadataByIdApi({
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

export const useTransactionMetadata = ({
  transactionId,
}: {
  transactionId: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && transactionId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? { key: "transaction-metadata", transactionId, accessToken }
      : null,
    fetchTransactionMetadataById,
    { refreshInterval: USE_TRANSACTION_METADATA_REFRESH_INTERVAL }
  );

  return {
    transactionMetadata: data?.transactionMetadata as TransactionMetadata,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
