import { backendUrl } from "@/lib/constants";

export const getSystemBalanceApi = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/balances/system`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
