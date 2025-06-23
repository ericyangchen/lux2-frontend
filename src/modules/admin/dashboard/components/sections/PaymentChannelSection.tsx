import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
} from "@/lib/constants/transaction";
import {
  SystemChannelPerformance,
  SystemPaymentMethodDistribution,
} from "@/lib/types/transaction";
import { formatNumber, formatNumberInInteger } from "@/lib/utils/number";

import { ChartCard } from "../cards/ChartCard";
import { currencySymbol } from "@/lib/constants/common";
import { transformPaymentMethodData } from "../../utils/chartDataTransformers";

export const PaymentChannelSection = ({
  systemPaymentMethodDistribution,
  systemChannelPerformance,
}: {
  systemPaymentMethodDistribution: SystemPaymentMethodDistribution;
  systemChannelPerformance: SystemChannelPerformance;
}) => {
  const paymentMethodData = transformPaymentMethodData(
    systemPaymentMethodDistribution?.paymentMethodData || []
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          支付類型及上游渠道
        </h2>
        <p className="text-gray-600">支付類型資金分布與渠道交易量分析</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Payment Method Distribution */}
        <ChartCard title="支付類型交易量" subtitle="各支付類型交易量百分比">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={130}
                dataKey="value"
                stroke="none"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value, name, props) => [
                  `${value} 筆 (${currencySymbol} ${formatNumber(
                    props.payload.totalAmount.toString()
                  )})`,
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: "500" }}>
                    {
                      PaymentMethodDisplayNames[
                        value as keyof typeof PaymentMethodDisplayNames
                      ]
                    }{" "}
                    ({entry.payload?.value || 0} 筆)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Payment Channel Performance Summary */}
      <div className="mt-6">
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              上游渠道績效摘要
            </CardTitle>
            <p className="text-sm text-gray-600">上游支付渠道的績效表現</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(systemChannelPerformance?.channelPerformanceData || [])
                .slice(0, 4)
                .map((channel, index) => (
                  <div
                    key={channel.channel}
                    className="p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {
                          PaymentChannelDisplayNames[
                            channel.channel as keyof typeof PaymentChannelDisplayNames
                          ]
                        }
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">總交易:</span>
                        <span className="font-medium">
                          {formatNumberInInteger(channel.total.toString())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">成功:</span>
                        <span className="font-medium text-green-600">
                          {formatNumberInInteger(channel.success.toString())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">失敗:</span>
                        <span className="font-medium text-red-600">
                          {formatNumberInInteger(channel.failed.toString())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">交易額:</span>
                        <span className="font-medium text-gray-900">
                          {currencySymbol}{" "}
                          {formatNumber(channel.successVolume.toString())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">手續費:</span>
                        <span className="font-medium text-gray-900">
                          {currencySymbol}{" "}
                          {formatNumber(channel.totalFees.toString())}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-gray-600">成功率:</span>
                        <span className="font-medium text-gray-900">
                          {channel.successRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">真實成功率:</span>
                        <span className="font-medium text-gray-900">
                          {channel.success + channel.failed > 0
                            ? Math.round(
                                (channel.success /
                                  (channel.success + channel.failed)) *
                                  10000
                              ) / 100
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
