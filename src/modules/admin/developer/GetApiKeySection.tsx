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

interface GetApiKeySectionProps {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export function GetApiKeySection({
  selectedOrganizationId,
  setSelectedOrganizationId,
  apiKey,
  setApiKey,
}: GetApiKeySectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGetApiKey = async () => {
    if (!selectedOrganizationId) {
      toast({
        title: "Error",
        description: "Please select an organization first",
        variant: "destructive",
      });
      return;
    }

    const { accessToken } = getApplicationCookies();
    if (!accessToken) {
      toast({
        title: "Error",
        description: "Access token not found",
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
        title: "Success",
        description: "API key retrieved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get API key",
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
        title: "Copied",
        description: "API key copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy API key",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get API Key</CardTitle>
        <CardDescription>
          Select an organization and retrieve its API key for integration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
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
          {isLoading ? "Loading..." : "Get API Key"}
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
              Click the copy button to copy the API key to your clipboard.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
