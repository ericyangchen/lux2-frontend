import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetUpstreamBalances = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/upstream-balances`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

