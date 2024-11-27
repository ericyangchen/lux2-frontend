import { Organization } from "@/lib/types/organization";

export function flattenOrganizations(org: Organization): Organization[] {
  let flatList = [{ ...org }]; // Add the current organization to the list

  if (org?.children) {
    org.children.forEach((child) => {
      flatList = flatList.concat(flattenOrganizations(child)); // Recursively flatten and concatenate child organizations
    });
  }

  return flatList;
}
