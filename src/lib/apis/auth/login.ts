import { backendUrl } from "@/lib/constants";

export const loginApi = async ({
  email,
  password,
  totpCode,
}: {
  email: string;
  password: string;
  totpCode?: string;
}) => {
  return fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, totpCode }),
  });
};
