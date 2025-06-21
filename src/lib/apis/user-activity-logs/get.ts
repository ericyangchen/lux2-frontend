import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { UserActivityAction } from "@/lib/enums/users/user-activity-action.enum";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetUserActivityLogs = async ({
  userId,
  organizationId,
  action,
  ipAddress,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  userId?: string;
  organizationId?: string;
  action?: UserActivityAction;
  ipAddress?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    userId,
    organizationId,
    action,
    ipAddress,
    limit,
    cursorCreatedAt,
    cursorId,
  });

  return fetch(`${getBackendUrl()}/user-activity-logs?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
