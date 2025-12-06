import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiAdminEnableTotp = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/users/${encodeURIComponent(userId)}/totp/enable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiAdminDisableTotp = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/users/${encodeURIComponent(userId)}/totp/disable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiMerchantEnableTotp = async ({
  organizationId,
  userId,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}/totp/enable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiMerchantDisableTotp = async ({
  organizationId,
  userId,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}/totp/disable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
