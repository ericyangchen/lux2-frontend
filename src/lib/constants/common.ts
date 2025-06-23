const getEnvVar = (key: string) => {
  const value = process.env[key];

  return value;
};

export const getEnvironment = () => {
  return "production"; // production
  return "development"; // development, local
  return getEnvVar("NEXT_PUBLIC_ENVIRONMENT");
};

export const getBackendUrl = () => {
  return "https://api.sm-pay.org"; // production
  return "https://api.dev.sm-pay.org"; // dev
  return "http://localhost:8080"; // local
  return getEnvVar("NEXT_PUBLIC_BACKEND_URL");
};

export const getCompanyName = () => {
  const environment = getEnvironment();

  if (environment === "development") {
    return "SM-Pay (Dev)";
  }

  if (environment === "staging") {
    return "SM-Pay (Staging)";
  }

  return "SM-Pay";
};

export const currencySymbol = "₱";
