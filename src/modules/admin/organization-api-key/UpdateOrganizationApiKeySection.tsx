import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";

import { ApiUpdateDeveloperOrganizationApiKey } from "@/lib/apis/organizations/developer";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "@/modules/admin/common/OrganizationSearchBar";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUserPermission } from "@/lib/hooks/useUserPermission";
import { Permission } from "@/lib/enums/permissions/permission.enum";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface UpdateOrganizationApiKeySectionProps {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  setApiKey: (key: string) => void;
  onUpdateSuccess?: () => void;
}

export function UpdateOrganizationApiKeySection({
  selectedOrganizationId,
  setSelectedOrganizationId,
  setApiKey,
  onUpdateSuccess,
}: UpdateOrganizationApiKeySectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useUserPermission({});

  const canUpdateApiKey = hasPermission(
    Permission.ADMIN_UPDATE_ORGANIZATION_API_KEY
  );

  const handleUpdateApiKey = async () => {
    if (!selectedOrganizationId) {
      toast({
        title: "錯誤",
        description: "請先選擇一個單位",
        variant: "destructive",
      });
      return;
    }

    const { accessToken } = getApplicationCookies();
    if (!accessToken) {
      toast({
        title: "錯誤",
        description: "找不到存取權杖",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await ApiUpdateDeveloperOrganizationApiKey({
        organizationId: selectedOrganizationId,
        accessToken,
      });

      if (!response.ok) {
        throw new Error("Failed to update API key");
      }

      const data = await response.json();
      setApiKey(data.apiKey);
      toast({
        title: "成功",
        description: "API Key 更新成功",
      });
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "更新 API Key 失敗",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!canUpdateApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>更新 API Key</CardTitle>
          <CardDescription>您沒有權限更新組織 API Key。</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700">更新 API Key</CardTitle>
        <CardDescription className="text-red-600">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>
              為選定的組織生成新的 API Key。這將使當前的 API Key
              立即失效，所有使用舊 Key 的應用程式將無法繼續運作。
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-800">
                ⚠️ 警告：此操作不可逆轉
              </p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>當前的 API Key 將立即失效</li>
                <li>所有使用舊 Key 的 API 請求將被拒絕</li>
                <li>相關應用程式需要立即更新為新的 Key</li>
                <li>可能導致服務中斷，請謹慎操作</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="update-organization">單位</Label>
          <OrganizationSearchBar
            selectedOrganizationId={selectedOrganizationId}
            setSelectedOrganizationId={setSelectedOrganizationId}
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isUpdating || !selectedOrganizationId}
              className="w-fit"
            >
              {isUpdating ? "更新中..." : "更新 API Key"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-red-200">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <AlertDialogTitle className="text-red-800 text-xl">
                  確認更新 API Key
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="space-y-3 text-base">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-800 mb-2">
                    ⚠️ 此操作將產生嚴重後果：
                  </p>
                  <ul className="space-y-2 text-red-700 list-disc list-inside">
                    <li>
                      當前的 API Key 將
                      <strong className="text-red-800">立即失效</strong>
                    </li>
                    <li>
                      所有使用舊 Key 的 API 請求將
                      <strong className="text-red-800">被拒絕</strong>
                    </li>
                    <li>
                      相關應用程式將
                      <strong className="text-red-800">無法正常運作</strong>
                    </li>
                    <li>
                      可能導致<strong className="text-red-800">服務中斷</strong>
                      ，影響業務運營
                    </li>
                  </ul>
                </div>
                <p className="font-medium text-gray-900">
                  您確定要繼續執行此操作嗎？此操作
                  <strong className="text-red-600">不可逆轉</strong>。
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUpdateApiKey}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                確認更新 API Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
