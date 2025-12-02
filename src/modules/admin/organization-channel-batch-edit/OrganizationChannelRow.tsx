import {
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Switch } from "@/components/shadcn/ui/switch";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { OrganizationChannelStatus } from "@/lib/apis/organization-available-channels/batch-edit";
import { formatNumber, formatNumberInPercentage } from "@/lib/utils/number";
import { classNames } from "@/lib/utils/classname-utils";
import { OrgTypeDisplayNames } from "@/lib/constants/organization";

export function OrganizationChannelRow({
  org,
  isEnabled,
  isModified,
  hasWarning,
  hasChildren,
  isExpanded,
  onToggleExpand,
  onToggleChange,
  onEnableAllChildren,
  onDisableAllChildren,
}: {
  org: OrganizationChannelStatus;
  isEnabled: boolean;
  isModified: boolean;
  hasWarning: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleChange: (enabled: boolean) => void;
  onEnableAllChildren: () => void;
  onDisableAllChildren: () => void;
}) {
  const canToggle = org.channelStatus !== "not_created";

  return (
    <div
      className={classNames(
        "flex items-center space-x-3 py-2 px-3 border-b",
        hasWarning ? "bg-yellow-50" : ""
      )}
      style={{ paddingLeft: `${org.level * 24 + 12}px` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
          {hasChildren ? (
            <button
              onClick={onToggleExpand}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <span className="text-sm font-medium text-gray-900">
            {org.organizationName}
          </span>

          <span className="text-xs text-gray-500">
            (
            {OrgTypeDisplayNames[
              org.organizationType as keyof typeof OrgTypeDisplayNames
            ] || org.organizationType}
            )
          </span>

          {hasWarning && (
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          )}

          {org.feeSettings && org.feeSettings.length > 0 && (
            <span className="text-xs text-gray-500">
              費率: {formatNumberInPercentage(org.feeSettings[0].percentage)},
              固定: {formatNumber(org.feeSettings[0].fixed)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {hasChildren && (
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEnableAllChildren}
              className="text-xs h-7 px-2"
            >
              全部啟用
            </Button>
            <span className="text-gray-300">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDisableAllChildren}
              className="text-xs h-7 px-2"
            >
              全部停用
            </Button>
          </div>
        )}

        {canToggle ? (
          <div
            className={classNames(
              "flex items-center space-x-2 pl-2",
              isModified ? "rounded-full bg-blue-50/70 px-2 py-1" : ""
            )}
          >
            <Switch
              checked={isEnabled}
              onCheckedChange={onToggleChange}
              className={classNames(
                "transition-colors data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300",
                isModified
                  ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-white"
                  : ""
              )}
            />
            {isModified && (
              <Badge
                variant="outline"
                className="text-xs font-semibold text-blue-600 border-blue-400"
              >
                已修改
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>
    </div>
  );
}
