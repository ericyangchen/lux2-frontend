import { getBackendUrl } from "@/lib/constants/common";

export const ApiUnblockAccount = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}): Promise<Response> => {
  const url = `${getBackendUrl()}/admin/blocked-accounts/${userId}/unblock`;

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface UnblockAccountResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    blocked: boolean;
  };
}
