import { Card, CardContent } from "@/components/shadcn/ui/card";

import { currencySymbol } from "@/lib/constants/common";
import { formatNumber } from "@/lib/utils/number";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  textColor?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  textColor = "text-gray-900",
  bgColor = "bg-white",
  icon,
}: StatCardProps) => {
  return (
    <Card
      className={`${bgColor} border border-gray-200 shadow-md hover:shadow-lg transition-shadow`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${textColor} mb-1`}>
              {currencySymbol} {formatNumber(value)}
            </p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          {icon && <div className="ml-4 p-3 bg-gray-50 rounded-lg">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};
