import { getCachedConfig } from "@/lib/config";

export const getEnvironment = () => {
  const config = getCachedConfig();
  return config.environment;
};

export const getBackendUrl = () => {
  const config = getCachedConfig();
  return config.backendUrl;
};

export const getCompanyName = () => {
  const environment = getEnvironment();

  if (environment === "development") {
    return "AApay (Dev)";
  }

  if (environment === "staging") {
    return "AApay (Staging)";
  }

  return "AApay";
};

export const currencySymbol = "₱";
