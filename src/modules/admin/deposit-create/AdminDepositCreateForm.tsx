import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useEffect, useState } from "react";

import { AdminCreateDepositRequest } from "@/lib/apis/admin/deposits/post";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrganizationSearchBar } from "@/modules/admin/common/OrganizationSearchBar";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import {
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
} from "@/lib/constants/transaction";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";

interface AdminDepositCreateFormProps {
  onSubmit: (data: AdminCreateDepositRequest) => void;
  isSubmitting: boolean;
}

export function AdminDepositCreateForm({
  onSubmit,
  isSubmitting,
}: AdminDepositCreateFormProps) {
  const [formData, setFormData] = useState<AdminCreateDepositRequest>({
    type: TransactionType.API_DEPOSIT,
    paymentMethod: PaymentMethod.NATIVE_GCASH,
    merchantId: "m01KARC19WSMFH6B9P1D62GKR9K", // Preset organization ID
    merchantOrderId: "",
    amount: "100", // Prefilled amount
    notifyUrl: "",
    redirectUrl: "",
    senderName: "Xiu Wei", // Prefilled sender name
    senderEmail: "xiuwei@gmail.com", // Prefilled sender email
    senderPhoneNumber: "9682269763", // Prefilled sender phone
  });

  // No need for additional state since OrganizationSearchBar handles organization selection

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof AdminCreateDepositRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateRandomOrderId = () => {
    const timestamp = Date.now();
    return `ADMIN-ORDER-${timestamp}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          value={formData.paymentMethod}
          onValueChange={(value) =>
            handleInputChange("paymentMethod", value as PaymentMethod)
          }
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PaymentMethodCurrencyMapping).map(
              ([currency, methods]) => {
                const validMethods = methods.filter(
                  (method): method is PaymentMethod =>
                    Object.values(PaymentMethod).includes(
                      method as PaymentMethod
                    )
                );
                if (validMethods.length === 0) return null;
                return (
                  <SelectGroup key={currency}>
                    <SelectLabel className="text-xs text-gray-500">
                      {currency}
                    </SelectLabel>
                    {validMethods.map((method) => (
                      <SelectItem key={method} value={method} className="pl-6">
                        {PaymentMethodDisplayNames[method]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              }
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Organization Search */}
      <div className="space-y-2">
        <Label>Organization</Label>
        <div className="max-w-md">
          <OrganizationSearchBar
            selectedOrganizationId={formData.merchantId}
            setSelectedOrganizationId={(organizationId) =>
              handleInputChange("merchantId", organizationId)
            }
            organizationType={OrgType.MERCHANT}
          />
        </div>
      </div>

      {/* Merchant Order ID */}
      <div className="space-y-2">
        <Label htmlFor="merchantOrderId">Merchant Order ID</Label>
        <div className="flex gap-2 max-w-lg">
          <Input
            id="merchantOrderId"
            value={formData.merchantOrderId}
            onChange={(e) =>
              handleInputChange("merchantOrderId", e.target.value)
            }
            placeholder="Enter merchant order ID"
            required
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              handleInputChange("merchantOrderId", generateRandomOrderId())
            }
            className="shrink-0"
          >
            Generate
          </Button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          value={formData.amount}
          onChange={(e) => handleInputChange("amount", e.target.value)}
          placeholder="Enter amount"
          required
          className="w-48"
        />
      </div>

      {/* Sender Information */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">
          Sender Information
        </h3>

        <div className="space-y-2">
          <Label htmlFor="senderName">Sender Name</Label>
          <Input
            id="senderName"
            className="max-w-sm"
            value={formData.senderName}
            onChange={(e) => handleInputChange("senderName", e.target.value)}
            placeholder="Enter sender name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senderPhoneNumber">Sender Phone Number</Label>
          <Input
            id="senderPhoneNumber"
            className="max-w-sm"
            value={formData.senderPhoneNumber}
            onChange={(e) =>
              handleInputChange("senderPhoneNumber", e.target.value)
            }
            placeholder="Enter sender phone number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senderEmail">Sender Email</Label>
          <Input
            id="senderEmail"
            type="email"
            value={formData.senderEmail}
            onChange={(e) => handleInputChange("senderEmail", e.target.value)}
            placeholder="Enter sender email"
            required
            className="max-w-md"
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Optional Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="notifyUrl">Notify URL</Label>
          <Input
            id="notifyUrl"
            value={formData.notifyUrl}
            onChange={(e) => handleInputChange("notifyUrl", e.target.value)}
            placeholder="Enter notify URL (optional)"
            className="max-w-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redirectUrl">Redirect URL</Label>
          <Input
            id="redirectUrl"
            value={formData.redirectUrl}
            onChange={(e) => handleInputChange("redirectUrl", e.target.value)}
            placeholder="Enter redirect URL (optional)"
            className="max-w-lg"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.merchantId}
          className="w-full max-w-md"
        >
          {isSubmitting ? "Creating..." : "Create Deposit Transaction"}
        </Button>
      </div>
    </form>
  );
}
