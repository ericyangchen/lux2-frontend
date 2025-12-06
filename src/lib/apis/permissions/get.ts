import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export interface Permission {
  id: string;
  name: string;
  scope: string[];
  description?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export const ApiGetPermissions = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<Response> => {
  return fetch(`${getBackendUrl()}/permissions`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

