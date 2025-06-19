import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiCreateOrganization = async ({
  name,
  type,
  parentId,
  accessToken,
}: {
  name: string;
  type: OrgType;
  parentId: string;
  accessToken: string;
}) => {
  const response = await fetch(`${backendUrl}/organizations`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ name, type, parentId }),
  });

  return response;
};
