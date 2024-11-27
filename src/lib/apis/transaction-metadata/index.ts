export const getTransactionMetadataByIdApi = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/transactions/${encodeURIComponent(transactionId)}/metadata`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updateTransactionMetadataNoteApi = async ({
  transactionId,
  note,
  accessToken,
}: {
  transactionId: string;
  note: string;
  accessToken: string;
}) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/transactions/${encodeURIComponent(transactionId)}/metadata`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ note }),
  });
};
