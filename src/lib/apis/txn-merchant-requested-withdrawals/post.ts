import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiCreateMerchantRequestedWithdrawal = async ({
  type,
  paymentMethod,
  merchantId,
  merchantOrderId,
  amount,
  notifyUrl,
  bankName,
  bankAccount,
  receiverName,
  receiverEmail,
  receiverPhoneNumber,
  accessToken,
}: {
  type: string;
  paymentMethod: string;
  merchantId: string;
  merchantOrderId: string;
  amount: string;
  notifyUrl?: string;
  bankName?: string;
  bankAccount?: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverPhoneNumber?: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/merchant-requested-withdrawal`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      type,
      paymentMethod,
      merchantId,
      merchantOrderId,
      amount,
      notifyUrl,
      bankName,
      bankAccount,
      receiverName,
      receiverEmail,
      receiverPhoneNumber,
    }),
  });
};
