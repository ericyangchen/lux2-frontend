import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiCreateUser = async ({
  organizationId,
  name,
  email,
  password,
  role,
  orgType,
  accessToken,
}: {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  orgType: OrgType;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/users`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      name,
      email,
      password,
      role,
      orgType,
    }),
  });
};
