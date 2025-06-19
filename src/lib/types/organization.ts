import { OrgType } from "../enums/organizations/org-type.enum";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  parent?: Organization;
  children: Organization[];
  apiKey?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
