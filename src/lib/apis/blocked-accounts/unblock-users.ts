import { getBackendUrl } from "@/lib/constants/common";

export const ApiUnblockUsers = async ({
  userIds,
  accessToken,
}: {
  userIds: string[];
  accessToken: string;
}): Promise<Response> => {
  const url = `${getBackendUrl()}/admin/blocked-accounts/unblock-users`;

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ userIds }),
  });
};

export interface UnblockUsersResponse {
  success: boolean;
  message: string;
}
