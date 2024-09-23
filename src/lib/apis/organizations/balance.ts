import { backendUrl } from "@/lib/constants";

export const getOrganizationBalancesApi = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/balances`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
