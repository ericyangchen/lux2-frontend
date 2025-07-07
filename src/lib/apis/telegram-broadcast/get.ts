import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetAvailableGroups = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/admin/telegram-broadcast/groups`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
