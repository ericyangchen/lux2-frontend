import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

import { ApiGetDeveloperOrganizationApiKey } from "@/lib/apis/organizations/developer";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "@/modules/admin/common/OrganizationSearchBar";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUserPermission } from "@/lib/hooks/useUserPermission";
import { Permission } from "@/lib/enums/permissions/permission.enum";

interface GetOrganizationApiKeySectionProps {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export function GetOrganizationApiKeySection({
  selectedOrganizationId,
  setSelectedOrganizationId,
  apiKey,
  setApiKey,
}: GetOrganizationApiKeySectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useUserPermission({});

  const canGetApiKey = hasPermission(Permission.ADMIN_GET_ORGANIZATION_API_KEY);

  const handleGetApiKey = async () => {
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

    setIsLoading(true);
    try {
      const response = await ApiGetDeveloperOrganizationApiKey({
        organizationId: selectedOrganizationId,
        accessToken,
      });

      if (!response.ok) {
        throw new Error("Failed to get API key");
      }

      const data = await response.json();
      setApiKey(data.apiKey);
      toast({
        title: "成功",
        description: "API Key 取得成功",
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "取得 API Key 失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({
        title: "已複製",
        description: "API Key 已複製到剪貼簿",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "錯誤",
        description: "複製 API Key 失敗",
        variant: "destructive",
      });
    }
  };

  if (!canGetApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>取得 API Key</CardTitle>
          <CardDescription>
            您沒有權限查看組織 API Key。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>取得 API Key</CardTitle>
        <CardDescription>
          選擇一個組織並取得其 API Key 以供整合使用。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organization">單位</Label>
          <OrganizationSearchBar
            selectedOrganizationId={selectedOrganizationId}
            setSelectedOrganizationId={setSelectedOrganizationId}
          />
        </div>

        <Button
          onClick={handleGetApiKey}
          disabled={isLoading || !selectedOrganizationId}
          className="w-fit"
        >
          {isLoading ? "載入中..." : "取得 API Key"}
        </Button>

        {apiKey && (
          <div className="space-y-2">
            <Label htmlFor="apikey">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apikey"
                value={apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={handleCopyApiKey}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              點擊複製按鈕將 API Key 複製到剪貼簿。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
