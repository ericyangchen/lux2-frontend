export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const companyName =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
    ? "SM-Pay (Dev)"
    : process.env.NEXT_PUBLIC_ENVIRONMENT === "staging"
    ? "SM-Pay (Staging)"
    : "SM-Pay";

export const currencySymbol = "₱";
