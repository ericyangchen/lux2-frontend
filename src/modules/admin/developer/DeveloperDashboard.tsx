import { GetApiKeySection } from "./GetApiKeySection";
import { UpdateApiKeySection } from "./UpdateApiKeySection";
import { TransactionCleanupSection } from "./TransactionCleanupSection";
import { useState } from "react";

export function DeveloperDashboard() {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Developer Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s API keys and developer tools.
        </p>
      </div>

      <GetApiKeySection
        selectedOrganizationId={selectedOrganizationId}
        setSelectedOrganizationId={setSelectedOrganizationId}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      <UpdateApiKeySection
        selectedOrganizationId={selectedOrganizationId}
        setSelectedOrganizationId={setSelectedOrganizationId}
        setApiKey={setApiKey}
      />

      <TransactionCleanupSection />
    </div>
  );
}
