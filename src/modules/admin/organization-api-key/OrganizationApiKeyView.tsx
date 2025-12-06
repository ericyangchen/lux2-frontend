import { GetOrganizationApiKeySection } from "./GetOrganizationApiKeySection";
import { UpdateOrganizationApiKeySection } from "./UpdateOrganizationApiKeySection";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/ui/tabs";

export function OrganizationApiKeyView() {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("get");

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          組織 API Key 管理
        </h1>
        <p className="text-muted-foreground">
          管理組織 API Key 以供整合使用。
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="get">取得 API Key</TabsTrigger>
          <TabsTrigger value="update">更新 API Key</TabsTrigger>
        </TabsList>

        <TabsContent value="get" className="mt-6">
          <GetOrganizationApiKeySection
            selectedOrganizationId={selectedOrganizationId}
            setSelectedOrganizationId={setSelectedOrganizationId}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />
        </TabsContent>

        <TabsContent value="update" className="mt-6">
          <UpdateOrganizationApiKeySection
            selectedOrganizationId={selectedOrganizationId}
            setSelectedOrganizationId={setSelectedOrganizationId}
            setApiKey={setApiKey}
            onUpdateSuccess={() => setActiveTab("get")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

