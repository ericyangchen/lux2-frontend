import { getBackendUrl } from "@/lib/constants/common";

export const ApiRevokeUserAccess = async ({
  userIds,
  accessToken,
}: {
  userIds: string[];
  accessToken: string;
}): Promise<Response> => {
  const url = `${getBackendUrl()}/admin/blocked-accounts/revoke-access`;

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ userIds }),
  });
};

export interface RevokeUserAccessResponse {
  success: boolean;
  message: string;
}
