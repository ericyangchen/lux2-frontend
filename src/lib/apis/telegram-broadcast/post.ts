import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export interface BroadcastMessageRequest {
  message: string;
  telegramChatIds: string[];
}

export const ApiSendBroadcastMessage = async ({
  accessToken,
  data,
}: {
  accessToken: string;
  data: BroadcastMessageRequest;
}) => {
  return fetch(`${getBackendUrl()}/admin/telegram-broadcast/send`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify(data),
  });
};
