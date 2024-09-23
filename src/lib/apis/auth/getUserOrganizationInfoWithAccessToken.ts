import { backendUrl } from "@/lib/constants";

export const getUserOrganizationInfoWithAccessTokenApi = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/auth/user-organization`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
