import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiUpdateOrganization = async ({
  organizationId,
  name,
  type,
  updateApiKey,
  isTestingAccount,
  accessToken,
}: {
  organizationId: string;
  name?: string;
  type?: OrgType;
  updateApiKey?: boolean;
  isTestingAccount?: boolean;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/organizations/${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
      body: JSON.stringify({ name, type, updateApiKey, isTestingAccount }),
    }
  );
};

export const ApiConvertTestingAccountToOfficial = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/organizations/testing-accounts/${encodeURIComponent(
      organizationId
    )}/convert-to-official`,
    {
      method: "PATCH",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
