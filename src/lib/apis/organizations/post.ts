import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
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
  const response = await fetch(`${getBackendUrl()}/organizations`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ name, type, parentId }),
  });

  return response;
};
