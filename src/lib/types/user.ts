import { OrgType } from "../enums/organizations/org-type.enum";

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  orgType: OrgType;
  permissions?: string[]; // Permissions from JWT or API
  isOtpEnabled: boolean;
  totpSecret?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
