import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiUpdateOrganization = async ({
  organizationId,
  name,
  type,
  updateApiKey,
  accessToken,
}: {
  organizationId: string;
  name?: string;
  type?: OrgType;
  updateApiKey?: boolean;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/organizations/${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
      body: JSON.stringify({ name, type, updateApiKey }),
    }
  );
};
