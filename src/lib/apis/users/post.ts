import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiAdminCreateUser = async ({
  organizationId,
  name,
  email,
  password,
  orgType,
  accessToken,
}: {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  orgType: OrgType;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/users`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      name,
      email,
      password,
      orgType,
    }),
  });
};

export const ApiMerchantCreateUser = async ({
  organizationId,
  name,
  email,
  password,
  orgType,
  accessToken,
}: {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  orgType: OrgType;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/organizations/${organizationId}/users`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      name,
      email,
      password,
      orgType,
    }),
  });
};
