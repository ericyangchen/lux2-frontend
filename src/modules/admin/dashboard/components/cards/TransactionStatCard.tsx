import { Card, CardContent } from "@/components/shadcn/ui/card";

import { formatNumberInInteger } from "@/lib/utils/number";

interface TransactionStatCardProps {
  title: string;
  value: string;
  successCount?: string;
  failedCount?: string;
  pendingCount?: string;
  icon?: React.ReactNode;
}

export const TransactionStatCard = ({
  title,
  value,
  successCount,
  failedCount,
  pendingCount,
  icon,
}: TransactionStatCardProps) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-3">
              {formatNumberInInteger(value)}
            </p>
            {(successCount !== undefined ||
              failedCount !== undefined ||
              pendingCount !== undefined) && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {successCount !== undefined && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">成功:</span>
                    <span className="font-medium text-green-600 ml-1">
                      {formatNumberInInteger(successCount)}
                    </span>
                  </div>
                )}
                {pendingCount !== undefined && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">處理中:</span>
                    <span className="font-medium text-amber-600 ml-1">
                      {formatNumberInInteger(pendingCount)}
                    </span>
                  </div>
                )}
                {failedCount !== undefined && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">失敗:</span>
                    <span className="font-medium text-red-600 ml-1">
                      {formatNumberInInteger(failedCount)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {icon && <div className="ml-4 p-3 bg-gray-50 rounded-lg">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};
