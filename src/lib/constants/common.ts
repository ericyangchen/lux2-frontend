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
    return "LuxPay (Dev)";
  }

  if (environment === "staging") {
    return "LuxPay (Staging)";
  }

  return "LuxPay";
};

export const currencySymbol = "₱";
