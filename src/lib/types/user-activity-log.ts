import { UserActivityAction } from "../enums/users/user-activity-action.enum";

export interface UserActivityLog {
  id: string;
  userId: string;
  organizationId?: string;
  action: UserActivityAction;
  description?: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}
