import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { getBackendUrl } from "@/lib/constants/common";

export interface AdminForceModifyTransactionData {
  status: TransactionStatus;
  message?: string;
  reason?: string;
}

export interface AdminForceModifyTransactionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: TransactionStatus;
    message?: string;
    updatedAt: string;
  };
}

export async function ApiAdminForceModifyTransaction({
  id,
  data,
  accessToken,
}: {
  id: string;
  data: AdminForceModifyTransactionData;
  accessToken: string;
}): Promise<Response> {
  const response = await fetch(
    `${getBackendUrl()}/admin/transactions/${id}/force-modify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response;
}
