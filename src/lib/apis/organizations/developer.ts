import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetDeveloperOrganizationApiKey = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/developer/organizations/${encodeURIComponent(
      organizationId
    )}/api-key`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiUpdateDeveloperOrganizationApiKey = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/developer/organizations/${encodeURIComponent(
      organizationId
    )}/api-key`,
    {
      method: "PATCH",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
