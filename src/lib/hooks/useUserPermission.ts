import { OrganizationType } from "../types/organization";
import { UserRole } from "../types/user";
import { useOrganizationInfo } from "./swr/organization";
import { useUser } from "./swr/user";

export const useUserPermission = ({
  accessingOrganizationId,
}: {
  accessingOrganizationId?: string;
}) => {
  const { user } = useUser();

  const { organization: userOrg } = useOrganizationInfo({
    organizationId: user?.organizationId,
  });

  if (!user || !userOrg) {
    return {};
  }

  const isGeneralAgentOrg = userOrg?.type === OrganizationType.GENERAL_AGENT;
  const isMerchantOrg = userOrg?.type === OrganizationType.MERCHANT;

  const isAdministrator = user.role === UserRole.ADMINISTRATOR;
  const isOperator = user.role === UserRole.OPERATOR;

  const accessingSelfOrg = accessingOrganizationId === user.organizationId;

  return {
    isGeneralAgentOrg,
    isMerchantOrg,
    isAdministrator,
    isOperator,
    accessingSelfOrg,
  };
};
