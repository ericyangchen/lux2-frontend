import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { UserActivityAction } from "@/lib/enums/users/user-activity-action.enum";
import { backendUrl } from "@/lib/constants/common";
import { buildQueryString } from "@/lib/utils/build-query-string";

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

  return fetch(`${backendUrl}/user-activity-logs?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
