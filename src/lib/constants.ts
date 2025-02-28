export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const companyName =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
    ? "SM Pay 測試版"
    : "SM Pay";

export const currencySymbol = "₱";
