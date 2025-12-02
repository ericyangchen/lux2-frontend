import { Organization } from "@/lib/types/organization";

/**
 * Recursively sorts an organization tree:
 * - Sorts children of each org by createdAt
 * - Recursively sorts each child's children
 * This ensures that when flattened, children appear immediately after their parent
 */
export function sortOrganizationTree(org: Organization): Organization {
  const sorted = { ...org };

  if (sorted.children && sorted.children.length > 0) {
    // Sort children by createdAt
    sorted.children = [...sorted.children]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      })
      // Recursively sort each child's subtree
      .map((child) => sortOrganizationTree(child));
  }

  return sorted;
}
