import { OrgType } from "../enums/organizations/org-type.enum";
import { UserRole } from "../enums/users/user-role.enum";
import { useOrganization } from "./swr/organization";
import { useUser } from "./swr/user";

export const useUserPermission = ({
  accessingOrganizationId,
}: {
  accessingOrganizationId?: string;
}) => {
  const { user } = useUser();

  const { organization: userOrg } = useOrganization({
    organizationId: user?.organizationId,
  });

  if (!user || !userOrg) {
    return {};
  }

  const isAdminOrg = userOrg?.type === OrgType.ADMIN;
  const isMerchantOrg = userOrg?.type === OrgType.MERCHANT;

  const isOwner = isAdminOrg
    ? user.role === UserRole.ADMIN_OWNER
    : user.role === UserRole.MERCHANT_OWNER;
  const isStaff = isAdminOrg
    ? user.role === UserRole.ADMIN_STAFF
    : user.role === UserRole.MERCHANT_STAFF;

  const isDeveloper = user.role === UserRole.DEVELOPER;

  const accessingSelfOrg = accessingOrganizationId === user.organizationId;

  return {
    isAdminOrg,
    isMerchantOrg,
    isOwner,
    isStaff,
    isDeveloper,
    accessingSelfOrg,
  };
};
