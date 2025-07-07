import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { SMPayWebHeaderWithAccessToken } from "../../smpay-web-header";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { getBackendUrl } from "@/lib/constants/common";

export interface AdminCreateDepositRequest {
  type: TransactionType;
  paymentMethod: PaymentMethod;
  merchantId: string;
  merchantOrderId: string;
  amount: string;
  notifyUrl?: string;
  redirectUrl?: string;
  senderName: string;
  senderEmail: string;
  senderPhoneNumber: string;
}

export interface AdminCreateDepositResponse {
  id: string;
  type: string;
  merchantId: string;
  merchantOrderId: string;
  paymentMethod: PaymentMethod;
  amount: string;
  totalFee: string;
  balanceChanged: string;
  status: string;
  message?: string;
  createdAt: string;
  paymentUrl?: string;
}

export const ApiAdminCreateDeposit = async ({
  accessToken,
  data,
}: {
  accessToken: string;
  data: AdminCreateDepositRequest;
}) => {
  return fetch(`${getBackendUrl()}/admin/deposits`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify(data),
  });
};
