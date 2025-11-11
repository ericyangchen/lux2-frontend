import { OrgType } from "../enums/organizations/org-type.enum";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  isTestingAccount: boolean;
  enabledApiVersions: string[];
  parent?: Organization;
  children: Organization[];
  level: number;
  apiKey?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
