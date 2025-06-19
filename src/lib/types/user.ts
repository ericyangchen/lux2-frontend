import { OrgType } from "../enums/organizations/org-type.enum";
import { UserRole } from "../enums/users/user-role.enum";

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  orgType: OrgType;
  role: UserRole;
  totpSecret?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
