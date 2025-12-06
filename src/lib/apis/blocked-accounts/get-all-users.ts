import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetAllUsers = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<Response> => {
  const url = `${getBackendUrl()}/admin/blocked-accounts/all-users`;

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface UserWithInfo {
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  isBlocked: boolean;
  tokenVersion: number;
}

export interface GetAllUsersResponse {
  success: boolean;
  data: UserWithInfo[];
}
