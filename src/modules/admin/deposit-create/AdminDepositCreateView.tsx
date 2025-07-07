import {
  AdminCreateDepositRequest,
  AdminCreateDepositResponse,
  ApiAdminCreateDeposit,
} from "@/lib/apis/admin/deposits/post";

import { AdminDepositCreateForm } from "./AdminDepositCreateForm";
import { ApplicationError } from "@/lib/error/applicationError";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function AdminDepositCreateView() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedDeposit, setLastCreatedDeposit] =
    useState<AdminCreateDepositResponse | null>(null);

  const handleSubmit = async (data: AdminCreateDepositRequest) => {
    if (!accessToken) {
      toast({
        title: "Error",
        description: "No access token available",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ApiAdminCreateDeposit({
        accessToken,
        data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const result: AdminCreateDepositResponse = await response.json();
      setLastCreatedDeposit(result);

      toast({
        title: "Success",
        description: `Deposit transaction created successfully: ${result.id}`,
      });
    } catch (error) {
      console.error("Error creating deposit:", error);
      toast({
        title: "Error",
        description:
          error instanceof ApplicationError
            ? error.message
            : "Failed to create deposit transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">創建代收交易</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section - Left */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-md font-medium text-gray-900 mb-6">
              Transaction Details
            </h3>
            <AdminDepositCreateForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Result Section - Right */}
          <div className="bg-white border border-gray-200  rounded-lg p-6">
            <h3 className="text-md font-medium text-gray-900 mb-6">
              Transaction Result
            </h3>
            {lastCreatedDeposit ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  Transaction Created Successfully
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <strong>Transaction ID:</strong> {lastCreatedDeposit.id}
                  </p>
                  <p>
                    <strong>Status:</strong> {lastCreatedDeposit.status}
                  </p>
                  <p>
                    <strong>Amount:</strong> {lastCreatedDeposit.amount}
                  </p>
                  <p>
                    <strong>Total Fee:</strong> {lastCreatedDeposit.totalFee}
                  </p>
                  <p>
                    <strong>Balance Changed:</strong>{" "}
                    {lastCreatedDeposit.balanceChanged}
                  </p>
                  {lastCreatedDeposit.paymentUrl && (
                    <p>
                      <strong>Payment URL:</strong>{" "}
                      <a
                        href={lastCreatedDeposit.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 break-all"
                      >
                        {lastCreatedDeposit.paymentUrl}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-500">
                  Transaction result will appear here after creation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
