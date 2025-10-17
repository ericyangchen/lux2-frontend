import { BlockedAccount } from "@/lib/types/blocked-account";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetBlockedAccounts = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<Response> => {
  const url = `${getBackendUrl()}/admin/blocked-accounts`;

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface GetBlockedAccountsResponse {
  success: boolean;
  data: BlockedAccount[];
}
