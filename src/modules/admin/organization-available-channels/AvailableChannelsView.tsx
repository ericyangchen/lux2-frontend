import { useState, useMemo } from "react";
import { OrganizationSearchBar } from "@/modules/admin/common/OrganizationSearchBar";
import { useAvailableChannelsVisualization } from "@/lib/hooks/swr/organization-available-channels";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentChannelDisplayNames } from "@/lib/constants/transaction";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/shadcn/ui/tabs";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { classNames } from "@/lib/utils/classname-utils";

export function AvailableChannelsView() {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>(
    TransactionType.API_DEPOSIT
  );

  const { data, isLoading } = useAvailableChannelsVisualization(
    selectedOrganizationId || undefined
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.map((org) => ({
      ...org,
      availableChannels: org.availableChannels.filter(
        (channel) => channel.transactionType === selectedTab
      ),
    }));
  }, [data, selectedTab]);

  // Group by payment method
  const groupedByPaymentMethod = useMemo(() => {
    const groups = new Map<
      PaymentMethod,
      Array<{
        paymentChannel: PaymentChannel;
        isAvailable: boolean;
      }>
    >();

    filteredData.forEach((org) => {
      org.availableChannels.forEach((channel) => {
        const paymentMethod = channel.paymentMethod as PaymentMethod;
        if (!groups.has(paymentMethod)) {
          groups.set(paymentMethod, []);
        }
        const channels = groups.get(paymentMethod)!;
        if (
          !channels.find((c) => c.paymentChannel === channel.paymentChannel)
        ) {
          channels.push({
            paymentChannel: channel.paymentChannel as PaymentChannel,
            isAvailable: channel.isAvailable,
          });
        } else {
          // If any org has it available, mark as available
          const existing = channels.find(
            (c) => c.paymentChannel === channel.paymentChannel
          );
          if (existing && channel.isAvailable) {
            existing.isAvailable = true;
          }
        }
      });
    });

    return groups;
  }, [filteredData]);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            選擇單位
          </label>
          <OrganizationSearchBar
            selectedOrganizationId={selectedOrganizationId}
            setSelectedOrganizationId={setSelectedOrganizationId}
          />
        </div>

        {selectedOrganizationId && (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value={TransactionType.API_DEPOSIT}>
                {TransactionTypeDisplayNames[TransactionType.API_DEPOSIT]}
              </TabsTrigger>
              <TabsTrigger value={TransactionType.API_WITHDRAWAL}>
                {TransactionTypeDisplayNames[TransactionType.API_WITHDRAWAL]}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {selectedOrganizationId && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">載入中...</div>
          ) : (
            Array.from(groupedByPaymentMethod.entries()).map(
              ([paymentMethod, channels]) => (
                <div key={paymentMethod} className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {PaymentMethodDisplayNames[paymentMethod]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {channels.map((channel) => (
                      <Card
                        key={channel.paymentChannel}
                        className={classNames(
                          "border-2",
                          channel.isAvailable
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 bg-gray-50"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {PaymentChannelDisplayNames[
                                  channel.paymentChannel
                                ] || channel.paymentChannel}
                              </p>
                              <p
                                className={classNames(
                                  "text-sm mt-1",
                                  channel.isAvailable
                                    ? "text-green-700"
                                    : "text-gray-500"
                                )}
                              >
                                {channel.isAvailable ? "可用" : "不可用"}
                              </p>
                            </div>
                            <div
                              className={classNames(
                                "w-4 h-4 rounded-full",
                                channel.isAvailable
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>
      )}

      {!selectedOrganizationId && (
        <div className="text-center text-gray-500 py-8">
          請選擇一個單位以查看可用渠道
        </div>
      )}
    </div>
  );
}
