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

interface UpdateApiKeySectionProps {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  setApiKey: (key: string) => void;
}

export function UpdateApiKeySection({
  selectedOrganizationId,
  setSelectedOrganizationId,
  setApiKey,
}: UpdateApiKeySectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateApiKey = async () => {
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
        title: "Success",
        description: "API key updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update API Key</CardTitle>
        <CardDescription>
          Generate a new API key for the selected organization. This will
          invalidate the current API key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="update-organization">Organization</Label>
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
              {isUpdating ? "Updating..." : "Update API Key"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm API Key Update</AlertDialogTitle>
              <AlertDialogDescription>
                This will generate a new API key for the selected organization.
                The current API key will be invalidated and any applications
                using it will need to be updated with the new key.
                <br />
                <br />
                Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUpdateApiKey}
                className="bg-red-600 hover:bg-red-700"
              >
                Update API Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
