import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiCreateMerchantRequestedWithdrawal = async ({
  type,
  paymentMethod,
  merchantId,
  merchantOrderId,
  amount,
  notifyUrl,
  accountType,
  accountName,
  phoneNumber,
  accessToken,
}: {
  type: string;
  paymentMethod: string;
  merchantId: string;
  merchantOrderId: string;
  amount: string;
  notifyUrl?: string;
  accountType?: string;
  accountName?: string;
  phoneNumber?: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/merchant-requested-withdrawal`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      type,
      paymentMethod,
      merchantId,
      merchantOrderId,
      amount,
      notifyUrl,
      accountType,
      accountName,
      phoneNumber,
    }),
  });
};
